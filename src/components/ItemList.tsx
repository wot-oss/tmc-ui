import React, { useState, useEffect } from 'react';

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
    [key: string]: string | undefined;
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

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://0.0.0.0:8080/inventory')
      .then((res) => res.json())
      .then((json) => {
        setItems(Array.isArray(json.data) ? json.data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch inventory.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <ul className="space-y-2 p-4">
      {items.map((item) => (
        <li key={item.links.self} className="rounded border p-2">
          {Object.entries(item).map(([key, value]) => (
            <div key={key}>
              <span className="font-semibold">{key}:</span> {String(value)}
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
};

export default ItemList;
