import { useEffect, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams, useLocation } from 'react-router-dom';
import defaultImage from '../assets/default-image.png';
import ErrorAlert from '../alerts/Error';
import FieldCard from '../components/base/FieldCard';
import DialogAction from '../components/DialogAction';
import { useAuth } from '../hooks/useAuth';
import { fetchApiThingModel } from '../services/apiData';
import type { ThingDescription } from 'wot-typescript-definitions';
import { fetchLocalThingModel } from '../services/localData';
import Dropdown from '../components/base/Dropdown';
import Loader from '../components/base/Loader';
import Button from '../components/base/Button';

const DEFAULT_IMAGE_SRC = defaultImage;

const Details = () => {
  const params = useParams();
  const fetchName = (params['*'] ?? params.name ?? '') as string;

  const location = useLocation();
  const stateItem: Item =
    location.state &&
    (
      location.state as {
        item: Item;
        imageSrc: string;
        deploymentType: DeploymentType;
      }
    ).item;

  const stateImageSrc: string =
    location.state &&
    (
      location.state as {
        item: Item;
        imageSrc: string;
        deploymentType: DeploymentType;
      }
    ).imageSrc;

  const deploymentType: DeploymentType =
    location.state &&
    (
      location.state as {
        item: Item;
        imageSrc: string;
        deploymentType: DeploymentType;
      }
    ).deploymentType;

  const [item] = useState<Item | ItemExtended>(stateItem);
  const [imageSrc] = useState<string>(stateImageSrc ?? DEFAULT_IMAGE_SRC);

  const [loading, setLoading] = useState<boolean>(!stateItem);
  const [error, setError] = useState<string | null>(null);
  const [fullDescription, setFullDescription] = useState<ThingDescription | null>(null);
  const { authorizationHeader, enabled, error: authError, isLoading: authLoading } = useAuth();

  const [openWith, setOpenWith] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState<string>(
    item.versions?.[0]?.version.model ?? '',
  );
  const dropdownData: { key: string; value: string }[] =
    item?.versions?.map((version) => {
      return { key: version.version.model, value: version.version.model };
    }) ?? [];

  function useThingDetailsSections(td: ThingDescription | null) {
    return [
      { name: 'Properties', items: Object.keys(td?.properties ?? {}) },
      { name: 'Actions', items: Object.keys(td?.actions ?? {}) },
      { name: 'Events', items: Object.keys(td?.events ?? {}) },
    ];
  }

  const fetchLocal = async (path: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchLocalThingModel(path);
      setFullDescription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchApi = async (fetchName: string) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchApiThingModel(__API_BASE__, fetchName, {
          authorizationHeader,
        });
        setFullDescription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);

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

    if (deploymentType !== 'SERVER_AVAILABLE') {
      const fullPath: string = item.versions?.[0].links.content ?? '';
      fetchLocal(fullPath);
    } else {
      if (enabled && authLoading && !authorizationHeader) {
        return;
      }

      if (enabled && !authorizationHeader) {
        setError(authError || 'Authentication failed.');
        setLoading(false);
        return;
      }

      fetchApi(fetchName);
    }
  }, [
    authorizationHeader,
    authError,
    authLoading,
    deploymentType,
    enabled,
    fetchName,
    item,
    stateItem,
  ]);

  const handleVersionChange = async (version: string) => {
    setSelectedVersion(version);
    const versionObject: Version | undefined = item.versions?.find(
      (v) => v.version.model === version,
    );

    if (!versionObject) {
      setError(`Version "${version}" not found.`);
      return;
    }

    const fullPath: string = versionObject.links.content ?? '';

    if (deploymentType !== 'SERVER_AVAILABLE') {
      fetchLocal(fullPath);
    } else {
      const res = await fetch(`${__API_BASE__}/${fullPath}`, {
        headers: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
      });
      if (!res.ok) {
        setError(`Failed to fetch version "${version}".`);
        return;
      }
      const data = await res.json();
      setFullDescription(data);
    }
  };

  const openFullDetails = async (version: string) => {
    if (!fetchName || !__API_BASE__) return;
    const versionObject: Version | undefined = item.versions?.find(
      (v) => v.version.model === version,
    );

    if (!versionObject) {
      setError(`Version "${version}" not found.`);
      return;
    }
    const fullPath: string = versionObject.links.content ?? '';

    if (deploymentType !== 'SERVER_AVAILABLE') {
      const baseUrl = import.meta.env.BASE_URL;

      const url = `${window.location.origin}${baseUrl}${fullPath}`;

      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const response = await fetch(`${__API_BASE__}/${fullPath}`, {
      headers: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
    });

    if (!response.ok) {
      setError('Failed to open full details.');
      return;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const sections = useThingDetailsSections(fullDescription);

  if (loading)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-canvas">
        <Loader text="Loading Thing Description..." />
      </div>
    );

  if (error)
    return (
      <div className="mx-auto w-full max-w-3xl p-6 sm:px-6 sm:pt-16 lg:px-8">
        <ErrorAlert mainMessage={error} redirectAfterMs={5000} fallbackRedirectTo="/" />
      </div>
    );
  if (!item) return null;

  return (
    <div className="min-h-dvh bg-surface-canvas">
      <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-x-8">
            <div className="flex-shrink-0 md:w-80">
              <div className="rounded-lg bg-media">
                <img
                  alt={`Product image of ${(item as ItemExtended).name ?? item.tmName}`}
                  src={imageSrc}
                  className="h-80 w-full rounded-lg object-contain p-4 shadow-md"
                />
              </div>
              <div className="mt-5 flex w-full items-center justify-between gap-4">
                <h1 className="shrink-0 text-sm font-medium uppercase tracking-[0.18em] text-text-secondary">
                  Version:
                </h1>
                <Dropdown
                  label="version"
                  id="currentVersion"
                  options={dropdownData}
                  value={selectedVersion}
                  onChange={handleVersionChange}
                  showChevron={true}
                  wrapperClassName="ml-auto w-full max-w-[13rem]"
                  className="block h-10 w-full px-3"
                ></Dropdown>
              </div>
              <div className="mt-4 divide-y divide-border-subtle border-t border-border-subtle"></div>
              <div className="mt-4 flex w-full items-center gap-3">
                <div className="flex-1">
                  <Button
                    type="button"
                    onClick={() => openFullDetails(selectedVersion)}
                    disabled={!fullDescription}
                    text="Open full details"
                    className="border p-4"
                    variant="default"
                  />
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    onClick={() => setOpenWith(true)}
                    text="Open with …"
                    className="border p-4"
                    variant="default"
                  />
                </div>
              </div>
            </div>

            {/* Right: flexible content */}
            <div className="mt-0 flex-1 px-4 text-text-secondary sm:px-0">
              <FieldCard
                label="Manufacturer"
                value={fullDescription?.['schema:manufacturer']?.['schema:name'] ?? item.tmName}
              />
              <FieldCard
                label="Author"
                value={fullDescription?.['schema:author']?.['schema:name'] ?? '—'}
              />
              <FieldCard label="Title" value={(fullDescription?.title as string) ?? '—'} />
              <FieldCard label="MPN" value={(fullDescription?.['schema:mpn'] as string) ?? '—'} />
              <div className="mt-2 flex items-center gap-10 divide-gray-200 border-t border-gray-200 pt-2">
                <div className="flex items-center gap-4">
                  <FieldCard label="Current Version" value={selectedVersion}></FieldCard>
                </div>
                <div className="flex items-center pl-10">
                  <FieldCard
                    label="Number of Versions"
                    value={item.versions?.length.toString() ?? '0'}
                  />
                </div>
              </div>

              <div className="mt-2 flex divide-y divide-border-subtle border-t border-border-subtle"></div>
              <FieldCard label="ID" value={fullDescription?.id ?? '—'} />
              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="">
                  Additional details
                </h2>

                <div className="divide-y divide-border-subtle border-t border-border-subtle">
                  {sections.map((detail) => (
                    <Disclosure key={detail.name} as="div" className="group">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="group-data-open:text-interactive-accent text-sm font-medium text-text-secondary">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="block h-6 w-6 text-icon-brand group-hover:text-interactive-hover group-data-[open]:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="hidden h-6 w-6 text-icon-brand group-hover:text-interactive-hover group-data-[open]:block"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pb-6">
                        {detail.items.length === 0 ? (
                          <p className="pl-5 text-sm text-text-secondary">No data to display</p>
                        ) : (
                          <ul
                            role="list"
                            className="list-disc space-y-1 pl-5 text-sm text-text-primary marker:text-text-marker"
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
