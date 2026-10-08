import { ThingDescription } from 'wot-typescript-definitions';

export type Link = {
  self: string;
  content?: string;
  [key: string]: string | undefined;
};

export type Version = {
  description: string;
  digest: string;
  externalID: string;
  links: Link;
  repo: string;
  timestamp: string;
  tmID: string;
  version: {
    model: string;
  };
};

export type Attachment = {
  links: Link;
  name: string;
  mediaType: string;
};

export type InventoryItem = {
  id: string;
  attachments?: Attachment[];
  links: Link;
  repo: string;
  'schema:author': {
    'schema:name': string;
    [key: string]: string;
  };
  'schema:description': string;
  'schema:manufacturer': {
    'schema:name': string;
    [key: string]: string;
  };
  'schema:mpn': string;
  tmName?: string;
  name?: string;
  versions: Version[] | null;
};

export type DetailedInventoryItem = ThingDescription & InventoryItem;
