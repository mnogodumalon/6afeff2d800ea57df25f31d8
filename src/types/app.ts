import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Pfauenbilder {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    foto?: string;
    beschreibung?: string;
    pfauenart?: LookupValue;
    motiv?: LookupValue[];
    aufnahmedatum?: string; // Format: YYYY-MM-DD oder ISO String
    aufnahmeort?: string;
    standort?: GeoLocation; // { lat, long, info }
    fotograf?: string;
    bewertung?: LookupValue;
    favorit?: boolean;
  };
}

export const APP_IDS = {
  PFAUENBILDER: '6afeff1756e54b4bd3bb6893',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'pfauenbilder': {
    pfauenart: [{ key: "blauer_pfau", get label() { return lookupLabel('pfauenbilder', 'pfauenart', "blauer_pfau") ?? "Blauer Pfau"; } }, { key: "gruener_pfau", get label() { return lookupLabel('pfauenbilder', 'pfauenart', "gruener_pfau") ?? "Grüner Pfau"; } }, { key: "kongopfau", get label() { return lookupLabel('pfauenbilder', 'pfauenart', "kongopfau") ?? "Kongopfau"; } }, { key: "weisser_pfau", get label() { return lookupLabel('pfauenbilder', 'pfauenart', "weisser_pfau") ?? "Weißer Pfau"; } }, { key: "andere", get label() { return lookupLabel('pfauenbilder', 'pfauenart', "andere") ?? "Andere"; } }],
    motiv: [{ key: "rad_schlagend", get label() { return lookupLabel('pfauenbilder', 'motiv', "rad_schlagend") ?? "Rad schlagend"; } }, { key: "portraet", get label() { return lookupLabel('pfauenbilder', 'motiv', "portraet") ?? "Porträt"; } }, { key: "federn", get label() { return lookupLabel('pfauenbilder', 'motiv', "federn") ?? "Federn"; } }, { key: "pfauenhenne", get label() { return lookupLabel('pfauenbilder', 'motiv', "pfauenhenne") ?? "Pfauenhenne"; } }, { key: "kueken", get label() { return lookupLabel('pfauenbilder', 'motiv', "kueken") ?? "Küken"; } }, { key: "im_flug", get label() { return lookupLabel('pfauenbilder', 'motiv', "im_flug") ?? "Im Flug"; } }],
    bewertung: [{ key: "stern_1", get label() { return lookupLabel('pfauenbilder', 'bewertung', "stern_1") ?? "1 Stern"; } }, { key: "stern_2", get label() { return lookupLabel('pfauenbilder', 'bewertung', "stern_2") ?? "2 Sterne"; } }, { key: "stern_3", get label() { return lookupLabel('pfauenbilder', 'bewertung', "stern_3") ?? "3 Sterne"; } }, { key: "stern_4", get label() { return lookupLabel('pfauenbilder', 'bewertung', "stern_4") ?? "4 Sterne"; } }, { key: "stern_5", get label() { return lookupLabel('pfauenbilder', 'bewertung', "stern_5") ?? "5 Sterne"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'pfauenbilder': {
    'titel': 'string/text',
    'foto': 'file',
    'beschreibung': 'string/textarea',
    'pfauenart': 'lookup/select',
    'motiv': 'multiplelookup/checkbox',
    'aufnahmedatum': 'date/date',
    'aufnahmeort': 'string/text',
    'standort': 'geo',
    'fotograf': 'string/text',
    'bewertung': 'lookup/radio',
    'favorit': 'bool',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreatePfauenbilder = StripLookup<Pfauenbilder['fields']>;