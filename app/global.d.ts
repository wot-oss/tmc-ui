declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly BASE_URL: string; //TODO
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ItemExtended extends InventoryItem {
  name?: string;
}

type Link = {
  self: string;
  content?: string;
  [key: string]: string | undefined;
};

type Version = {
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

type Attachments = {
  links: Link;
  name: string;
  mediaType: string;
};

type InventoryItem = {
  attachments?: Attachments[];
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
