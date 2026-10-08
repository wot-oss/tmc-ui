import React from 'react';
import Loader from '../base/Loader';
import Card from './Card';
import Link from 'next/link';
import type { Attachment, InventoryItem, Version } from './types';

const DEFAULT_IMAGE_SRC = '/default-image.png';

const buildItemKey = (itemTM: InventoryItem, i: number): string =>
  `${itemTM.repo}:${itemTM.repo}:${itemTM['schema:mpn']}:row-${i}`;

// TODO: adapt the builder on client to the next.js migration
export const buildItemImageSrc = (
  tmName: string | undefined,
  attachments: Attachment[] | undefined,
): string => {
  if (!attachments) return DEFAULT_IMAGE_SRC;

  const pngImageSrc: Attachment | undefined = attachments.find((att) => att.name.endsWith('png'));

  if (!process.env.SERVER_URL) {
    if (!tmName || !pngImageSrc) return DEFAULT_IMAGE_SRC;

    return `${tmName}/.attachments/${pngImageSrc?.name}`;
  }

  if (!pngImageSrc) return DEFAULT_IMAGE_SRC;

  const attachmentLink: string | undefined = pngImageSrc.links.content;

  if (!attachmentLink) return DEFAULT_IMAGE_SRC;

  if (!process.env.API_BASE) return DEFAULT_IMAGE_SRC;

  return `${process.env.API_BASE}/${attachmentLink.replaceAll('../', '')}`;
};

const CARD_CLASS_NAME =
  "relative min-w-0 rounded-[4px] border border-border-default bg-surface-panel shadow-md before:pointer-events-none before:absolute before:bottom-[-3px] before:left-[-3px] before:right-[-3px] before:top-[-3px] before:rounded-[4px] before:border before:border-focus-ring before:opacity-0 before:content-[''] focus-within:rounded-[4px] focus-within:border focus-within:border-border-default focus-within:bg-surface-panel focus-within:outline-none focus-within:before:opacity-100 hover:bg-surface-panel-hover hover:shadow-sm hover:outline-interactive-support-hover";

export function InventoryResults({ items, loading }: { items: InventoryItem[]; loading: boolean }) {
  if (loading) return <Loader text="Loading catalog..." />;

  const getLatestTmID = (versions: Version[]): string | undefined => {
    return versions.reduce<Version | undefined>((latest, current) => {
      if (!latest) return current;

      return compareVersions(current.version.model, latest.version.model) > 0 ? current : latest;
    }, undefined)?.tmID;
  };

  const compareVersions = (a: string, b: string): number => {
    const av = a.split('.').map(Number);
    const bv = b.split('.').map(Number);

    for (let i = 0; i < Math.max(av.length, bv.length); i++) {
      const diff = (av[i] ?? 0) - (bv[i] ?? 0);
      if (diff !== 0) return diff;
    }

    return 0;
  };

  return (
    <div className="w-full">
      <ul
        role="list"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] gap-6"
      >
        {items.map((itemTM, i) => {
          const key = buildItemKey(itemTM, i);
          const title = itemTM.name ?? itemTM.tmName;
          const imageSrc = buildItemImageSrc(title, itemTM.attachments);
          const versionCount = itemTM.versions?.length ?? 0;

          return (
            <li key={key} className={CARD_CLASS_NAME}>
              <Link
                className="block h-full"
                href={`/details/${encodeURIComponent(getLatestTmID(itemTM.versions ?? []) ?? '')}`}
              >
                <Card
                  title={title}
                  author={itemTM['schema:author']['schema:name']}
                  manufacturer={itemTM['schema:manufacturer']['schema:name']}
                  imageSrc={imageSrc}
                  imageAlt={`Product image of ${title}`}
                  imageFallbackSrc={DEFAULT_IMAGE_SRC}
                >
                  <div className="border-border-subtle mt-5 flex flex-1 flex-col border-t pt-4">
                    {itemTM['schema:description'] && (
                      <p className="text-text-secondary mb-4 line-clamp-2 text-sm leading-5">
                        {itemTM['schema:description']}
                      </p>
                    )}
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                      <dt className="text-text-tertiary font-medium">Repository</dt>
                      <dd className="text-text-primary truncate text-right">
                        {itemTM.repo ?? '—'}
                      </dd>
                      <dt className="text-text-tertiary font-medium">Model ID</dt>
                      <dd className="text-text-primary truncate text-right">
                        {itemTM['schema:mpn'] ?? '—'}
                      </dd>
                      {itemTM.links?.content && (
                        <>
                          <dt className="text-text-tertiary font-medium">Content</dt>
                          <dd className="text-text-primary truncate text-right">
                            {itemTM.links.content}
                          </dd>
                        </>
                      )}
                    </dl>
                    <p className="text-interactive-support mt-auto pt-5 text-xs font-semibold uppercase">
                      {versionCount} version{versionCount === 1 ? '' : 's'} available
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default React.memo(InventoryResults);
