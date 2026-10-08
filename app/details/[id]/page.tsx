'use client';
import Dropdown from '@/app/_components/base/Dropdown';
import Loader from '@/app/_components/base/Loader';
import { fetchTmContentFromServer } from '@/lib/services/apiData';
import { fetchLocalThingModel } from '@/lib/services/localData';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import {
  ArrowLeftIcon,
  ShareIcon,
  CodeBracketIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/20/solid';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorUI } from '@/app/_components/error/ErrorUI';
import type { DetailedInventoryItem } from '@/app/_components/inventory/types';
import { buildItemImageSrc } from '@/app/_components/inventory/InventoryResults';
import Button from '@/app/_components/base/Button';
import { TmJsonModal } from './_components/TmJsonModal';
import ShareModal from './_components/ShareModal';

// TODO: create a loading component that shows the loader only after 1-2 seconds to avoid UI flash
export default function Details() {
  const { id: paramId } = useParams<{ id: string }>();
  const id = decodeURIComponent(paramId);

  const { authorizationHeader } = useAuth();
  const router = useRouter();

  // TM data
  const [TM, setTM] = useState<DetailedInventoryItem | null>(null);

  // Page state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isTmJsonOpen, setTmJsonOpen] = useState(false);

  const navigateBack = () => {
    router.back();
  };

  // Load Thing Model
  useEffect(() => {
    void (async () => {
      setError(null);
      try {
        let data: DetailedInventoryItem | null = null;

        if (process.env.SERVER_URL) {
          data = await fetchTmContentFromServer(id, {
            authorizationHeader,
          });
        } else {
          // TODO: adapt to fetch TM by ID
          data = await fetchLocalThingModel(TM?.versions?.[0].links.content ?? '');
        }
        setTM(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropdownData: { key: string; value: string }[] =
    TM?.versions?.map((version) => {
      return { key: version.tmID, value: version.version.model };
    }) ?? [];

  const sections = useMemo(
    () => [
      { name: 'Properties', items: Object.keys(TM?.properties ?? {}) },
      { name: 'Actions', items: Object.keys(TM?.actions ?? {}) },
      { name: 'Events', items: Object.keys(TM?.events ?? {}) },
    ],
    [TM?.actions, TM?.events, TM?.properties],
  );

  if (error)
    return (
      <div className="mx-auto w-full max-w-3xl p-6 sm:px-6 sm:pt-16 lg:px-8">
        <ErrorUI description={error} buttonOnclick={navigateBack} />
      </div>
    );

  if (!TM || isLoading)
    return (
      <div className="bg-surface-canvas flex min-h-dvh items-center justify-center">
        <Loader text="Loading Thing Model..." />
      </div>
    );

  return (
    <div className="bg-surface-canvas min-h-dvh">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="border-border-subtle mb-8 border-b pb-6">
          <Button
            type="button"
            onClick={navigateBack}
            className="text-interactive-primary hover:text-interactive-hover mb-2 px-0"
            variant="none"
            size="sm"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            Back to catalog
          </Button>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <h1 className="text-text-primary min-w-0 flex-1 text-3xl font-semibold wrap-break-word sm:text-4xl">
              {TM.title || TM.name || TM.tmName || 'Untitled Thing Model'}
            </h1>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  setTmJsonOpen(true);
                }}
                className="justify-center gap-1.5 border"
                variant="default"
                size="sm"
              >
                <CodeBracketIcon aria-hidden="true" className="size-4 shrink-0" />
                Open TM JSON
              </Button>
              <Button
                type="button"
                onClick={() => setShareUrl(window.location.href)}
                className="justify-center gap-1.5 border"
                variant="default"
                size="sm"
              >
                <ShareIcon aria-hidden="true" className="size-4 shrink-0" />
                Share
              </Button>
            </div>
          </div>
          {(TM.description || TM['schema:description']) && (
            <p className="text-text-secondary mt-3 max-w-2xl text-sm leading-6 wrap-break-word">
              {TM.description || TM['schema:description']}
            </p>
          )}
        </header>
        <div className="grid min-w-0 gap-8 md:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0">
            <div className="bg-media overflow-hidden rounded-lg">
              <img
                alt={`Product image of ${TM.name ?? TM.tmName}`}
                src={buildItemImageSrc(TM.tmName, TM.attachments)}
                className="aspect-square w-full object-contain p-6"
              />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <label htmlFor="currentVersion" className="text-text-secondary text-sm font-medium">
                  Model version
                </label>
                <span className="text-text-tertiary text-right text-xs">
                  {TM.versions?.length ?? 0} versions available
                </span>
              </div>
              <Dropdown
                label="version"
                id="currentVersion"
                options={dropdownData}
                value={TM?.id ?? ''}
                onChange={(value) => {
                  router.replace(`/details/${encodeURIComponent(value ?? '')}`);
                }}
                showChevron={true}
                wrapperClassName="w-full"
                className="block h-10 w-full px-3"
              ></Dropdown>
            </div>
          </aside>
          <div className="min-w-0">
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-text-primary text-lg font-semibold">
                Overview
              </h2>
              <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {[
                  { label: 'Manufacturer', value: TM['schema:manufacturer']?.['schema:name'] },
                  { label: 'Author', value: TM['schema:author']?.['schema:name'] },
                  { label: 'MPN', value: TM['schema:mpn'] },
                  { label: 'Current version', value: TM.version?.model },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-text-secondary text-xs font-medium">{label}</dt>
                    <dd className="text-text-primary mt-1 text-base font-medium wrap-break-word">
                      {typeof value === 'string' && value ? value : 'Not provided'}
                    </dd>
                  </div>
                ))}
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-text-secondary text-xs font-medium">Model ID</dt>
                  <dd className="text-text-primary mt-2 font-mono text-sm break-all">
                    {TM.id || 'Not provided'}
                  </dd>
                </div>
              </dl>
            </section>
            <section aria-labelledby="details-heading" className="mt-9">
              <h2 id="details-heading" className="text-text-primary mb-4 text-lg font-semibold">
                Interactions
              </h2>
              <div className="divide-border-subtle border-border-subtle divide-y border-y">
                {sections.map((detail) => (
                  <Disclosure key={detail.name} as="div" className="group">
                    <h3>
                      <DisclosureButton className="group focus-visible:outline-focus-ring relative flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2">
                        <span className="group-data-open:text-interactive-accent text-text-primary text-sm font-medium">
                          {detail.name}
                        </span>
                        <span className="text-text-secondary ml-auto text-sm tabular-nums">
                          {detail.items.length}
                        </span>
                        <span className="flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="text-icon-brand group-hover:text-interactive-hover block h-6 w-6 group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="text-icon-brand group-hover:text-interactive-hover hidden h-6 w-6 group-data-open:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      {detail.items.length === 0 ? (
                        <p className="text-text-secondary pl-5 text-sm">No data to display</p>
                      ) : (
                        <ul
                          role="list"
                          className="text-text-primary marker:text-text-marker list-disc space-y-1 pl-5 text-sm"
                        >
                          {detail.items.map((d) => (
                            <li key={d} className="pl-2 wrap-break-word">
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <TmJsonModal isOpen={isTmJsonOpen} setIsOpen={setTmJsonOpen} TM={TM} />
      {shareUrl !== null && (
        <ShareModal url={shareUrl} version={TM.version?.model} onClose={() => setShareUrl(null)} />
      )}
    </div>
  );
}
