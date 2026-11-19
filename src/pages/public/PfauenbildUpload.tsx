import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { Bound } from '@/components/blocks/Bound';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Button } from '@/components/ui/button';
import { tx } from '@/i18n';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import {
  loadPublicPagesConfig, prepareChallenge,
  type PublicPagesConfig, type PublicPageConfig,
} from '@/lib/publicClient';

const SLUG = 'pfauenbild-upload';

interface UploadFormProps {
  cfg: PublicPagesConfig;
  page: PublicPageConfig;
}

function UploadForm({ cfg, page }: UploadFormProps) {
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);
  const f = useStepForm('pfauenbilder', {
    fields: ['titel', 'foto'],
    required: { titel: true, foto: true },
    messages: {
      titel: 'Bitte einen Namen eingeben.',
      foto: 'Bitte ein Bild auswählen.',
    },
    autoComplete: true,
  });
  const submit = useJourneySubmit(
    port,
    [{ key: 'bild', entity: 'pfauenbilder', form: f, primary: true }],
    { draftKey: SLUG },
  );

  const foto = f.get('foto');
  const preview = typeof foto === 'string' && foto.startsWith('data:image') ? foto : null;

  const warm = () => {
    const ep = page.endpoints?.find(e => e.op === 'create');
    if (ep) prepareChallenge(cfg, page, 'POST', `/apps/${ep.app_id}/records`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.validate(['titel', 'foto'])) return;
    await submit.run();
  };

  const another = () => {
    submit.reset();
    f.reset();
  };

  if (submit.result) {
    return (
      <SuccessStep
        result={submit.result}
        title={tx('Danke! Dein Pfauenbild ist angekommen.')}
        whatHappensNext={tx('Dein Bild wurde erfolgreich hochgeladen.')}
        next={[{ label: tx('Noch ein Bild hochladen'), onClick: another }]}
        actions={{ copy: false, print: false }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={warm} className="space-y-5" noValidate>
      <Bound form={f} name="titel" label={tx('Dein Name')} placeholder={tx('Name eingeben')} />
      <Bound form={f} name="foto" label={tx('Dein Bild')} />
      {preview && (
        <img
          src={preview}
          alt={tx('Vorschau deines Bildes')}
          className="w-full max-h-80 object-contain rounded-xl border bg-muted"
        />
      )}
      {submit.error && (
        <p role="alert" className="text-sm text-destructive">
          {tx('Das Hochladen hat leider nicht geklappt. Bitte versuche es noch einmal.')}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submit.submitting}>
        {submit.submitting ? tx('Wird hochgeladen …') : tx('Bild hochladen')}
      </Button>
    </form>
  );
}

export default function PfauenbildUpload() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG).then(c => {
      setCfg(c);
      setPage(c?.pages[SLUG] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }

  return (
    <PublicShell title={page.title} description={page.description}>
      <UploadForm cfg={cfg} page={page} />
    </PublicShell>
  );
}
