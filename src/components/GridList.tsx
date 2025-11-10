import React from 'react';
import defaultImage from '../assets/default-image.png';
import FourZeroFourNotFound from './404NotFound';

const DEFAULT_IMAGE_SRC = defaultImage;

const GridList: React.FC<{ items: Item[]; loading: boolean; error: string | null }> = ({
  items,
  loading,
  error,
}) => {
  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
      <div className="p-4">
        <FourZeroFourNotFound error={error}></FourZeroFourNotFound>
      </div>
    );

  return (
    <div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((itemTM, i) => {
          const key = `${itemTM.repo}:${itemTM.repo}:${itemTM['schema:mpn']}:row-${i}`;

          return (
            <li
              key={key}
              className="col-span-1 divide-y divide-white/10 rounded-lg bg-white outline -outline-offset-1 outline-white/10 hover:shadow-sm hover:outline-gray-900"
            >
              <div
                className="flex w-full items-center justify-between space-x-6 p-6"
                onClick={() => console.log(itemTM.tmName)}
              >
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium">{itemTM.tmName}</h3>
                    <span className="inset-ring inset-ring-green-500/10 inline-flex shrink-0 items-center rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-500">
                      {itemTM.tmName}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {itemTM['schema:manufacturer']['schema:name']}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {itemTM.links.content ?? ''}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-400">{itemTM.repo.concat(', ')}</p>
                  <p className="mt-1 truncate text-sm text-gray-400">{itemTM['schema:mpn']}</p>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {itemTM['schema:description']}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-400">{itemTM.tmName}</p>
                  <p className="mt-1 truncate text-sm text-gray-400">{itemTM.repo}</p>
                </div>
                <img
                  alt={`Product image of ${itemTM.tmName}`}
                  src={DEFAULT_IMAGE_SRC}
                  className="size-20 shrink-0 rounded-md bg-gray-700 outline -outline-offset-1 outline-white/10"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GridList;
