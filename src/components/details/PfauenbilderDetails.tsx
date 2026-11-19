import type { Pfauenbilder } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';
import { MapRouteLinks } from '@/components/widgets/MapWidget';
import { usePermissions } from '@/lib/permissions';

export interface PfauenbilderDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Pfauenbilder;
}

export function PfauenbilderDetails({
  record,
}: PfauenbilderDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('pfauenbilder', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('pfauenbilder', 'foto')} className="md:col-span-2">
          {record.fields.foto ? (
            <MediaThumbnail src={record.fields.foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('pfauenbilder', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pfauenbilder', 'pfauenart')} value={record.fields.pfauenart} format="pill" />
        <RecordField label={fieldLabel('pfauenbilder', 'motiv')} value={Array.isArray(record.fields.motiv) ? record.fields.motiv.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('pfauenbilder', 'aufnahmedatum')} value={record.fields.aufnahmedatum} format="date" />
        <RecordField label={fieldLabel('pfauenbilder', 'aufnahmeort')} value={record.fields.aufnahmeort} format="text" />
        <RecordField label={fieldLabel('pfauenbilder', 'standort')}>
          {record.fields.standort ? (
            <div className="space-y-1">
              <div>{record.fields.standort.info ?? `${record.fields.standort.lat}, ${record.fields.standort.long}`}</div>
              {/* Directions links — the map popup is hover-fleeting; the overlay
                  is the only mobile-reachable place for navigation. */}
              <MapRouteLinks lat={record.fields.standort.lat} long={record.fields.standort.long} />
            </div>
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('pfauenbilder', 'fotograf')} value={record.fields.fotograf} format="text" />
        <RecordField label={fieldLabel('pfauenbilder', 'bewertung')} value={record.fields.bewertung} format="pill" />
        <RecordField label={fieldLabel('pfauenbilder', 'favorit')} value={record.fields.favorit} format="bool" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.PFAUENBILDER} recordId={record.record_id} readOnly={!perms.canWrite('pfauenbilder')} />
    </>
  );
}
