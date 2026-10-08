'use client';
import Dropdown from '@/app/_components/base/Dropdown';
import FieldCard from '@/app/_components/base/FieldCard';
import Loader from '@/app/_components/base/Loader';
import DialogAction from '@/app/_components/DialogAction';
import { fetchTmContentFromServer } from '@/lib/services/apiData';
import { fetchLocalThingModel } from '@/lib/services/localData';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/20/solid';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorUI } from '@/app/_components/error/ErrorUI';
import type { DetailedInventoryItem } from '@/app/_components/inventory/types';
import { buildItemImageSrc } from '@/app/_components/inventory/InventoryResults';
import Button from '@/app/_components/base/Button';

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
  const [openWith, setOpenWith] = useState(false);

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
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <Button
          type="button"
          onClick={navigateBack}
          className="text-interactive-primary hover:text-interactive-hover mb-6 px-1"
          variant="default"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-5" />
          Back to catalog
        </Button>
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-x-8">
            <div className="shrink-0 md:w-80">
              <div className="bg-media rounded-lg">
                <img
                  alt={`Product image of ${TM.name ?? TM.tmName}`}
                  src={buildItemImageSrc(TM.tmName, TM.attachments)}
                  className="h-80 w-full rounded-lg object-contain p-4 shadow-md"
                />
              </div>
              <div className="mt-5 flex w-full items-center justify-between gap-4">
                <h1 className="text-text-secondary shrink-0 text-sm font-medium tracking-[0.18em] uppercase">
                  Version:
                </h1>
                <Dropdown
                  label="version"
                  id="currentVersion"
                  options={dropdownData}
                  value={TM?.id ?? ''}
                  onChange={(value) => {
                    router.replace(`/details/${encodeURIComponent(value ?? '')}`);
                  }}
                  showChevron={true}
                  wrapperClassName="ml-auto w-full max-w-[13rem]"
                  className="block h-10 w-full px-3"
                ></Dropdown>
              </div>
              <div className="divide-border-subtle border-border-subtle mt-4 divide-y border-t"></div>
              <div className="mt-4 flex w-full items-center gap-3">
                <div className="flex-1">
                  <Button
                    type="button"
                    onClick={() => {}}
                    disabled={!TM}
                    className="border p-4"
                    variant="default"
                  >
                    Open full details
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    onClick={() => setOpenWith(true)}
                    className="border p-4"
                    variant="default"
                  >
                    Open with …
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: flexible content */}
            <div className="text-text-secondary mt-0 flex-1 px-4 sm:px-0">
              <FieldCard
                label="Manufacturer"
                value={TM?.['schema:manufacturer']?.['schema:name'] ?? TM.tmName}
              />
              <FieldCard label="Author" value={TM?.['schema:author']?.['schema:name'] ?? '—'} />
              <FieldCard label="Title" value={(TM?.title as string) ?? '—'} />
              <FieldCard label="MPN" value={(TM?.['schema:mpn'] as string) ?? '—'} />
              <div className="mt-2 flex items-center gap-10 divide-gray-200 border-t border-gray-200 pt-2">
                <div className="flex items-center gap-4">
                  <FieldCard
                    label="Current Version"
                    value={(TM?.version?.model as string) ?? '—'}
                  ></FieldCard>
                </div>
                <div className="flex items-center pl-10">
                  <FieldCard
                    label="Number of Versions"
                    value={TM.versions?.length.toString() ?? '0'}
                  />
                </div>
              </div>

              <div className="divide-border-subtle border-border-subtle mt-2 flex divide-y border-t"></div>
              <FieldCard label="ID" value={TM?.id ?? '—'} />
              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="">
                  Additional details
                </h2>

                <div className="divide-border-subtle border-border-subtle divide-y border-t">
                  {sections.map((detail) => (
                    <Disclosure key={detail.name} as="div" className="group">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="group-data-open:text-interactive-accent text-text-secondary text-sm font-medium">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
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
                              <li key={d} className="pl-2">
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
        </div>
      </main>
      <DialogAction open={openWith} onClose={() => setOpenWith(false)} TM={TM} />
    </div>
  );
}
