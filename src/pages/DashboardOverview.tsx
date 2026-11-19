import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconHeart, IconHeartFilled, IconPlus, IconStar, IconStarFilled, IconPhoto } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { Pfauenbilder } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { tx, appLabel, dateFnsLocale } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { Button } from '@/components/ui/button';
import { ChartWidget, type ChartRow, type ChartSegment } from '@/components/widgets/ChartWidget';

// Galerie-first: no widget covers a photo-tile gallery (MediaViewer only zooms single
// assets on detail surfaces) — tiles open the record overlay, the image stays passive.

function stars(r: Pfauenbilder): number {
  const k = lookupKey(r.fields.bewertung);
  const n = k ? Number(k.replace('stern_', '')) : 0;
  return Number.isFinite(n) ? n : 0;
}

function sortKey(r: Pfauenbilder): string {
  return r.fields.aufnahmedatum ?? r.createdat ?? '';
}

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { pfauenbilder, setPfauenbilder, fetchAll } = data;
  const crud = useEntityCrud(data);
  const clock = useClock();
  const [onlyFav, setOnlyFav] = useState(false);
  const [onlyTop, setOnlyTop] = useState(false);
  const [sel, setSel] = useState<ChartSegment<Pfauenbilder> | null>(null);

  const sorted = useMemo(
    () => [...pfauenbilder].sort((a, b) => sortKey(b).localeCompare(sortKey(a))),
    [pfauenbilder],
  );
  const rows = useMemo<ChartRow<Pfauenbilder>[]>(
    () => pfauenbilder.map(p => ({ id: `pfauenbilder:${p.record_id}`, data: p })),
    [pfauenbilder],
  );

  const favs = sorted.filter(p => p.fields.favorit);
  const top = sorted.filter(p => stars(p) === 5);
  const unrated = sorted.filter(p => stars(p) === 0);

  const visible = sorted.filter(p => {
    if (onlyFav && !p.fields.favorit) return false;
    if (onlyTop && stars(p) !== 5) return false;
    if (sel && !sel.test({ id: `pfauenbilder:${p.record_id}`, data: p })) return false;
    return true;
  });

  const toggleFav = (rec: Pfauenbilder) => {
    const next = !rec.fields.favorit;
    const prev = !!rec.fields.favorit;
    const set = (v: boolean) =>
      setPfauenbilder(list => list.map(p => (p.record_id === rec.record_id ? { ...p, fields: { ...p.fields, favorit: v } } : p)));
    set(next);
    LivingAppsService.updatePfauenbilderEntry(rec.record_id, { favorit: next }).catch(() => { set(prev); fetchAll(); });
    const name = rec.fields.titel ?? '';
    undoToast(
      next ? tx`${name} — als Lieblingsbild markiert` : tx`${name} — Markierung entfernt`,
      () => {
        set(prev);
        LivingAppsService.updatePfauenbilderEntry(rec.record_id, { favorit: prev }).catch(() => fetchAll());
      },
    );
  };

  const newest = sorted[0];
  const context = sorted.length === 0
    ? tx`Noch keine Bilder — lade das erste Pfauenfoto hoch.`
    : favs.length > 0
      ? tx`Zuletzt dabei: ${newest?.fields.titel ?? ''}. Lieblingsbilder: ${namen(favs.map(f => f.fields.titel ?? ''))}.`
      : tx`Zuletzt dabei: ${newest?.fields.titel ?? ''}. Markiere ein Bild mit dem Herz als Lieblingsbild.`;

  const createBtn = crud.pfauenbilder.canWrite && (
    <Button onClick={() => crud.pfauenbilder.openCreate({})} className="gap-2">
      <IconPlus size={16} className="shrink-0" />
      {tx('Neues Pfauenbild')}
    </Button>
  );

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
        <p className="text-sm text-muted-foreground">{context}</p>
      </div>
      {createBtn}
    </div>
  );

  if (sorted.length === 0) {
    return (
      <div className="space-y-8">
        {header}
        <div className="rounded-[27px] bg-card shadow-lg p-10 flex flex-col items-center text-center gap-3 overflow-hidden">
          <IconPhoto size={48} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{tx('Deine Pfauen-Galerie ist noch leer.')}</p>
          {crud.pfauenbilder.canWrite && (
            <Button onClick={() => crud.pfauenbilder.openCreate({})}>{tx('Erstes Pfauenbild erfassen')}</Button>
          )}
        </div>
        {crud.surfaces}
      </div>
    );
  }

  const gallery = (
    <div className="rounded-[27px] bg-card shadow-lg p-5 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {appLabel('pfauenbilder')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {visible.length === sorted.length ? tx`${sorted.length} Bilder, neueste zuerst` : tx`${visible.length} von ${sorted.length} Bildern`}
        </span>
      </div>
      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{tx('Keine Bilder für diese Auswahl.')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {visible.map(p => {
            const n = stars(p);
            const fav = !!p.fields.favorit;
            return (
              <div
                key={p.record_id}
                className={`relative rounded-2xl overflow-hidden bg-muted/40 border ${fav ? 'border-rose-400 ring-1 ring-rose-300' : 'border-border'}`}
              >
                <button type="button" onClick={() => crud.pfauenbilder.openDetail(p)} className="block w-full text-left">
                  <div className="aspect-[4/3] bg-muted">
                    {p.fields.foto ? (
                      <img src={p.fields.foto} alt={p.fields.titel ?? ''} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <IconPhoto size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-3 min-w-0">
                    <div className="truncate text-sm font-medium">{p.fields.titel ?? '—'}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[p.fields.pfauenart?.label, p.fields.aufnahmedatum ? formatDate(p.fields.aufnahmedatum) : null].filter(Boolean).join(' · ')}
                    </div>
                    <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                      {n > 0
                        ? Array.from({ length: n }).map((_, i) => <IconStarFilled key={i} size={13} />)
                        : <IconStar size={13} className="text-muted-foreground" />}
                    </div>
                  </div>
                </button>
                {crud.pfauenbilder.canWrite && (
                  <button
                    type="button"
                    aria-label={tx('Lieblingsbild umschalten')}
                    onClick={() => toggleFav(p)}
                    className="absolute top-2 right-2 h-9 w-9 rounded-full bg-background/90 shadow flex items-center justify-center"
                  >
                    {fav ? <IconHeartFilled size={18} className="text-rose-500" /> : <IconHeart size={18} className="text-muted-foreground" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {header}
      <DashboardGrid
        variant="split"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Lieblingsbilder')}
              value={favs.length}
              icon={<IconHeart size={16} className="text-muted-foreground" />}
              tone={favs.length > 0 ? 'primary' : 'default'}
              onClick={() => setOnlyFav(v => !v)}
              active={onlyFav}
            />
            <StatStripItem
              title={tx('5 Sterne')}
              value={top.length}
              icon={<IconStar size={16} className="text-muted-foreground" />}
              onClick={() => setOnlyTop(v => !v)}
              active={onlyTop}
            />
          </StatStrip>
        }
        primary={gallery}
        aside={
          <>
            <ChartWidget<Pfauenbilder>
              title={tx('Bilder je Pfauenart')}
              rows={rows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.pfauenart, label: tx('Pfauenart') }}
              interaction={{ mode: 'filter', selectedKey: sel?.key ?? null, onSelect: setSel }}
              footer={<>{tx('Stand')}: {format(clock, 'P', { locale: dateFnsLocale() })}</>}
            />
            <WorkList
              title={tx('Noch ohne Bewertung')}
              items={unrated.map(p => ({
                id: p.record_id,
                title: p.fields.titel ?? '—',
                secondLine: <span className="text-muted-foreground">{p.fields.pfauenart?.label ?? tx('Art offen')}</span>,
                action: crud.pfauenbilder.canWrite ? { label: tx('Bewerten'), onClick: () => crud.pfauenbilder.openEdit(p) } : undefined,
              }))}
              onItemClick={id => {
                const rec = pfauenbilder.find(p => p.record_id === id);
                if (rec) crud.pfauenbilder.openDetail(rec);
              }}
              empty={{ text: tx('Alle Bilder sind bewertet.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
