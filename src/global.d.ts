declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare const __API_BASE__: string;

declare const __CATALOG_URL__: string;

declare const __DEBUG__: boolean;

declare const __SERVER_AVAILABLE__: boolean;
interface ImportMetaEnv {
  readonly VITE_REPO_URL?: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
type DeploymentType = 'SERVER_AVAILABLE' | 'TYPE_TMC-UI-CATALOG' | 'TYPE_CATALOG-TMC-UI';
interface IDataLoader {
  readonly deploymentType: DeploymentType;
  readonly inventory: readonly unknown[];
}

interface ItemExtended extends Item {
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

type Item = {
  attachments?: Attachments[];
  links: Link;
  repo: string;
  'schema:author': {
    'schema:name': string;
    [key: string]: string;
  };
  'schema:manufacturer': {
    'schema:name': string;
    [key: string]: string;
  };
  'schema:mpn': string;
  tmName?: string;
  name?: string;
  versions: Version[];
};

type Filters = {
  id: string;
  name: string;
  options: FilterData[];
}[];

type FilterData = {
  value: string;
  label: string;
  checked: boolean;
};
