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