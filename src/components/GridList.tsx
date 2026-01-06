import React from 'react';
import defaultImage from '../assets/default-image.png';
import FourZeroFourNotFound from './404NotFound';
import { Link } from 'react-router-dom';


const DEFAULT_IMAGE_SRC = defaultImage;


const buildItemKey = (itemTM: Item, i: number): string => `${itemTM.repo}:${itemTM.repo}:${itemTM['schema:mpn']}:row-${i}`;;

const buildItemImageSrc = (  attachments: Attachments[] | undefined): string => {

  if (!attachments) return DEFAULT_IMAGE_SRC;
  const pngImageSrc: Attachments | undefined = attachments.find((att) => att.name.endsWith('png'));
  
  if (!pngImageSrc) return DEFAULT_IMAGE_SRC;
  const attachmentLink: string | undefined = pngImageSrc.links.content;
  
  if (!attachmentLink) return DEFAULT_IMAGE_SRC;
  if (!__API_BASE__) return DEFAULT_IMAGE_SRC;
  
  return `${__API_BASE__}/${attachmentLink}`;
};


const GridList: React.FC<{ items: Item[]; loading: boolean; error: string | null }> = ({
  items,
  loading,
  error,
}) => {
  if (loading) return <div className="p-4 text-textValue">Loading...</div>;
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
          const key = buildItemKey(itemTM, i);
          const imageSrc = buildItemImageSrc(itemTM.attachments);

          return (
            <li
              key={key}
              className="col-span-1 divide-y divide-white/10 rounded-lg bg-bgBodySecondary shadow-md outline -outline-offset-1 outline-white/10 hover:shadow-sm hover:outline-buttonOnHover"
            >
              <Link to={`/details/${itemTM.tmName}`} state={{ item: itemTM, imageSrc: imageSrc }}>
                <div
                  className="flex w-full items-center justify-between space-x-6 p-6"
                  
                >
                  <div className="flex-1 truncate text-textValue">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium">{itemTM.tmName}</h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-textHighlight px-1.5 py-0.5 text-xs font-medium text-success">
                      {itemTM['schema:author']['schema:name']}
                    </span>
                    <p className="mt-1 truncate text-sm text-textLabel">
                      {itemTM['schema:manufacturer']['schema:name']}
                    </p>
                    <p className="mt-1 truncate text-sm text-textLabel">
                      {itemTM.links.content ?? ''}
                    </p>
                    <p className="mt-1 truncate text-sm text-textLabel">
                      {itemTM.repo.concat(', ')}
                    </p>
                    <p className="mt-1 truncate text-sm text-textLabel">{itemTM['schema:mpn']}</p>
                    <p className="mt-1 truncate text-sm text-textLabel">
                      {itemTM['schema:description']}
                    </p>

                    <p className="mt-1 truncate text-sm text-textLabel">
                      Number of Versions available: {itemTM.versions.length}
                    </p>
                  </div>
                  <div className='flex-1 bg-bgBodySecondary'>
                  <img
                    loading="lazy"
                    decoding="async"
                    alt={`Product image of ${itemTM.tmName}`}
                    src={imageSrc}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE_SRC;
                    }}
                    className="size-20 shrink-0 aspect-square object-contain rounded-md outline -outline-offset-1 outline-white/10"
                  />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GridList;
