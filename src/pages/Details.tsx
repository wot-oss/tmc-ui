import { useEffect, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { useParams, useLocation } from 'react-router-dom';
import { SETTINGS_URL_CATALOG, THING_MODELS_ENDPOINT } from '../utils/constants';
import { getLocalStorage } from '../utils/utils';
import defaultImage from '../assets/default-image.png';
import FieldCard from '../components/base/FieldCard';
import FourZeroFourNotFound from '../components/404NotFound';
import type { ThingDescription } from 'wot-typescript-definitions';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Details = () => {
  const params = useParams();
  const rawId = (params['*'] ?? params.name ?? '') as string;

  const location = useLocation();
  const stateItem = location.state && (location.state as { item?: Item }).item;
  const [item, setItem] = useState<Item | undefined>(stateItem);

  const [loading, setLoading] = useState<boolean>(!stateItem);
  const [error, setError] = useState<string | null>(null);
  const [fullDescription, setFullDescription] = useState<ThingDescription | null>(null);

  function useThingDetailsSections(td: ThingDescription | null) {
    return [
      { name: 'Properties', items: Object.keys(td?.properties ?? {}) },
      { name: 'Actions', items: Object.keys(td?.actions ?? {}) },
      { name: 'Events', items: Object.keys(td?.events ?? {}) },
    ];
  }

  useEffect(() => {
    if (!rawId) {
      setError('Missing item id.');
      setLoading(false);
      return;
    }
    const base = getLocalStorage(SETTINGS_URL_CATALOG);
    if (!base) {
      setError('No catalog configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${base}/${THING_MODELS_ENDPOINT}/${encodeURIComponent(rawId)}`);
        if (!res.ok) {
          setError('Item not found.');
          setLoading(false);
          return;
        }
        const json = await res.json();
        setFullDescription(json.data ?? json);
      } catch (e) {
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    })();
  }, [rawId, stateItem]);

  const sections = useThingDetailsSections(fullDescription);

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!item) return null;

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-x-8">
            <div className="flex-shrink-0 md:w-80">
              <img
                alt="Default image"
                src={defaultImage}
                className="h-80 w-full rounded-lg object-cover shadow-sm"
              />
            </div>

            {/* Right: flexible content */}
            <div className="mt-0 flex-1 px-4 sm:px-0">
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
                    <Disclosure key={detail.name} as="div">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="group-data-open:text-indigo-600 text-sm font-medium text-gray-900">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="group-data-open:hidden block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="group-data-open:block hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pb-6">
                        <ul
                          role="list"
                          className="list-disc space-y-1 pl-5 text-sm text-gray-700 marker:text-gray-300"
                        >
                          {detail.items.map((d) => (
                            <li key={d} className="pl-2">
                              {d}
                            </li>
                          ))}
                        </ul>
                        {detail.items.length === 0 ? (
                          <p className="pl-5 text-sm text-gray-500">No data to display</p>
                        ) : (
                          <ul
                            role="list"
                            className="list-disc space-y-1 pl-5 text-sm text-gray-700 marker:text-gray-300"
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
    </div>
  );
};

export default Details;
