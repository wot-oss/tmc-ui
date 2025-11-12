declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
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

type Item = {
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
  tmName: string;
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
