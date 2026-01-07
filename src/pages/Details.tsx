import { useEffect, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams, useLocation } from 'react-router-dom';
import { THING_MODEL_ENDPOINT } from '../utils/constants';
import defaultImage from '../assets/default-image.png';
import FieldCard from '../components/base/FieldCard';
import DialogAction from '../components/Dialog';
import type { ThingDescription } from 'wot-typescript-definitions';

const DEFAULT_IMAGE_SRC = defaultImage;

const Details = () => {
  const params = useParams();
  const fetchName = (params['*'] ?? params.name ?? '') as string;

  const location = useLocation();
  const stateItem = location.state && (location.state as { item?: Item; imageSrc?: string }).item;
  const stateImageSrc =
    location.state && (location.state as { item?: Item; imageSrc?: string }).imageSrc;

  const [item] = useState<Item | undefined>(stateItem);
  const [imageSrc] = useState<string>(stateImageSrc ?? DEFAULT_IMAGE_SRC);

  const [loading, setLoading] = useState<boolean>(!stateItem);
  const [error, setError] = useState<string | null>(null);
  const [fullDescription, setFullDescription] = useState<ThingDescription | null>(null);

  const [openWith, setOpenWith] = useState(false);

  function useThingDetailsSections(td: ThingDescription | null) {
    return [
      { name: 'Properties', items: Object.keys(td?.properties ?? {}) },
      { name: 'Actions', items: Object.keys(td?.actions ?? {}) },
      { name: 'Events', items: Object.keys(td?.events ?? {}) },
    ];
  }

  useEffect(() => {
    if (!fetchName) {
      setError('Missing item id.');
      setLoading(false);
      return;
    }
    if (!__API_BASE__) {
      setError('No catalog configured.');
      setLoading(false);
      return;
    }

    if (!item) {
      setError('No item found.');
      setLoading(false);
      return;
    }
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `${__API_BASE__}/${THING_MODEL_ENDPOINT}/${encodeURIComponent(fetchName)}`,
        );
        if (!res.ok) {
          setError('Item not found.');
          setLoading(false);
          return;
        }
        const json = await res.json();
        setFullDescription(json.data ?? json);
      } catch {
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchName, stateItem, item]);

  const openFullDetails = (fullDescription: ThingDescription | null) => {
    if (!fullDescription) return;
    const jsonText = JSON.stringify(fullDescription, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      const revoke = () => URL.revokeObjectURL(url);
      win.addEventListener?.('unload', revoke);
      setTimeout(revoke, 60_000);
    } else {
      window.location.href = url;
    }
  };

  const sections = useThingDetailsSections(fullDescription);

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!item) return null;

  return (
    <div className="min-h-dvh bg-bgBodyPrimary">
      <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-x-8">
            <div className="flex-shrink-0 md:w-80">
              <img
                alt={`Product image of ${item.tmName}`}
                src={imageSrc}
                className="h-80 w-full rounded-lg object-contain shadow-md"
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => openFullDetails(fullDescription)}
                  disabled={!fullDescription}
                  className="inline-flex items-center rounded-md bg-buttonPrimary px-3 py-2 text-sm font-semibold text-textWhite hover:bg-buttonOnHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-buttonFocus disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Open full details
                </button>
                <button
                  type="button"
                  onClick={() => setOpenWith(true)}
                  className="inline-flex items-center rounded-md border border-buttonBorder bg-buttonPrimary px-3 py-2 text-sm font-semibold text-textWhite hover:bg-buttonOnHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-buttonFocus"
                >
                  Open with …
                </button>
              </div>
            </div>

            {/* Right: flexible content */}
            <div className="mt-0 flex-1 px-4 text-textGray sm:px-0">
              <FieldCard label="Name" value={item.tmName} />
              <FieldCard label="Author" value={item['schema:author']?.['schema:name'] ?? '—'} />
              <FieldCard label="Repository" value={item.repo} />
              <FieldCard label="MPN" value={item['schema:mpn']} />
              <FieldCard
                label="Number of Versions"
                value={item.versions?.length.toString() ?? '0'}
              />
              <FieldCard label="Current Version" value={item.versions?.[0].version.model ?? '—'} />
              <FieldCard label="Description" value={item.versions?.[0].description ?? '—'} />
              <FieldCard label="ID" value={fullDescription?.id ?? '—'} />
              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="">
                  Additional details
                </h2>

                <div className="divide-y divide-gray-200 border-t border-gray-200">
                  {sections.map((detail) => (
                    <Disclosure key={detail.name} as="div" className="group">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="group-data-open:text-indigo-600 text-sm font-medium text-textLabel">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="group-hover:buttonOnHover block h-6 w-6 text-buttonPrimary group-data-[open]:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="group-hover:buttonOnHover hidden h-6 w-6 text-buttonPrimary group-data-[open]:block"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pb-6">
                        {detail.items.length === 0 ? (
                          <p className="pl-5 text-sm text-textLabel">No data to display</p>
                        ) : (
                          <ul
                            role="list"
                            className="list-disc space-y-1 pl-5 text-sm text-textValue marker:text-gray-300"
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
      <DialogAction
        open={openWith}
        onClose={() => setOpenWith(false)}
        fullDescription={fullDescription}
      />
    </div>
  );
};

export default Details;
