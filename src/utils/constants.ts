export const INVENTORY_ENDPOINT = 'inventory';

export const THING_MODELS_ENDPOINT = 'thing-models';

export const SEARCH_ENDPOINT = 'inventory?search=';

export const REPOSITORY_ENDPOINT = 'repos';

export const MANUFACTURER_ENDPOINT = 'manufacturers';

export const AUTHOR_ENDPOINT = 'authors';

export const PROTOCOLS_FILTER = 'filter.protocol=';
//http://0.0.0.0:8080/inventory?filter.protocol=http%2Chttps
export const AUTHOR_FILTER = 'filter.author=';

export const PROTOCOLS: FilterData[] = [
  { value: 'http/https', label: 'HTTP/HTTPS', checked: false },
  { value: 'modbus', label: 'Modbus', checked: false },
  { value: 'modbus+tcp', label: 'Modbus TCP', checked: false },
  { value: 'mqtt', label: 'MQTT', checked: false },
  { value: 'websocket', label: 'WebSocket', checked: false },
  { value: 'coap', label: 'CoAP', checked: false },
];
