export const INVENTORY_ENDPOINT = 'inventory';

export const THING_MODEL_ENDPOINT = 'thing-models/.latest';

export const SEARCH_ENDPOINT = 'inventory?search=';

export const REPOSITORY_ENDPOINT = 'repos';

export const MANUFACTURER_ENDPOINT = 'manufacturers';

export const AUTHOR_ENDPOINT = 'authors';

export const PROTOCOLS_FILTER = 'filter.protocol=';

export const AUTHOR_FILTER = 'filter.author=';

export const PROTOCOLS: FilterData[] = [
  { value: 'http/https', label: 'HTTP/HTTPS', checked: false },
  { value: 'modbus', label: 'Modbus', checked: false },
  { value: 'modbus+tcp', label: 'Modbus TCP', checked: false },
  { value: 'mqtt', label: 'MQTT', checked: false },
  { value: 'websocket', label: 'WebSocket', checked: false },
  { value: 'coap', label: 'CoAP', checked: false },
];

export const THEME_KEY = 'tmc-ui-theme';

export const OPTIONS_LIST_SIZE = 10;

export const SCROLL_THRESHOLD_PX = 64;

export const INVENTORY_TIMEOUT_MS = 1000;

export const REPOSITORY_CATALOG_DEFAULT_FOLDER = '.tmc/';

export const AUTHORS_FILENAME = 'tmnames.txt'; // it will be latter another file

export const PROTOCOLS_FILENAME = 'protocols.txt';

export const MANUFACTURERS_FILENAME = 'manufacturers.txt';

export const INVENTORY_FILENAME = 'tm-catalog.toc.json';
