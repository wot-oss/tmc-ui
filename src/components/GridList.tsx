import React from 'react';
import defaultImage from '../assets/default-image.png';
import AppError from './AppError';
import { Link } from 'react-router-dom';
import Loader from './base/Loader';
import Card from './Card';

const DEFAULT_IMAGE_SRC = defaultImage;

const buildItemKey = (itemTM: Item, i: number): string =>
  `${itemTM.repo}:${itemTM.repo}:${itemTM['schema:mpn']}:row-${i}`;

const buildItemImageSrc = (
  tmName: string | undefined,
  deploymentType: DeploymentType | string,
  attachments: Attachments[] | undefined,
): string => {
  if (!attachments) return DEFAULT_IMAGE_SRC;

  const pngImageSrc: Attachments | undefined = attachments.find((att) => att.name.endsWith('png'));

  if (deploymentType !== 'SERVER_AVAILABLE') {
    if (!tmName || !pngImageSrc) return DEFAULT_IMAGE_SRC;

    return `${tmName}/.attachments/${pngImageSrc?.name}`;
  }

  if (!pngImageSrc) return DEFAULT_IMAGE_SRC;

  const attachmentLink: string | undefined = pngImageSrc.links.content;

  if (!attachmentLink) return DEFAULT_IMAGE_SRC;

  if (!__API_BASE__) return DEFAULT_IMAGE_SRC;

  return `${__API_BASE__}/${attachmentLink}`;
};

const CARD_CLASS_NAME =
  "col-span-1 relative rounded-[4px] border border-border-default bg-surface-panel shadow-md before:pointer-events-none before:absolute before:bottom-[-3px] before:left-[-3px] before:right-[-3px] before:top-[-3px] before:rounded-[4px] before:border before:border-focus-ring before:opacity-0 before:content-[''] focus-within:rounded-[4px] focus-within:border focus-within:border-border-default focus-within:bg-surface-panel focus-within:outline-none focus-within:before:opacity-100 hover:bg-surface-panel-hover hover:shadow-sm hover:outline-interactive-support-hover";

const GridList: React.FC<{
  items: ItemExtended[];
  loading: boolean;
  error: string | null;
}> = ({ items, loading, error }) => {
  if (loading) return <Loader text="Loading catalog..." />;

  if (error)
    return (
      <div className="p-4">
        <AppError titleError={error} codeError={404}></AppError>
      </div>
    );

  return (
    <div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((itemTM, i) => {
          const key = buildItemKey(itemTM, i);
          const title = itemTM.name ?? itemTM.tmName;
          const imageSrc = buildItemImageSrc(title, __DEPLOY_TYPE__, itemTM.attachments);

          return (
            <li key={key} className={CARD_CLASS_NAME}>
              <Link
                to={`/details/${title}`}
                state={{
                  item: itemTM,
                  imageSrc: imageSrc,
                  deploymentType: __DEPLOY_TYPE__,
                }}
              >
                <Card
                  title={title}
                  author={itemTM['schema:author']['schema:name']}
                  manufacturer={itemTM['schema:manufacturer']['schema:name']}
                  imageSrc={imageSrc}
                  imageAlt={`Product image of ${title}`}
                  imageFallbackSrc={DEFAULT_IMAGE_SRC}
                >
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {itemTM.links?.content ?? ''}
                  </p>
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {itemTM.repo?.concat(', ') ?? ''}
                  </p>
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {itemTM['schema:mpn']}
                  </p>
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {itemTM['schema:description'] ?? ''}
                  </p>
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {itemTM.versions.length} Version{itemTM.versions.length > 1 ? 's' : ''}{' '}
                    available
                  </p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GridList;
