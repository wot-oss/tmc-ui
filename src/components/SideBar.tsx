import React, { useMemo, useState, useEffect } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import FilterOptions from './FilterOptions';
import Button from './base/Button';

interface SideBarProps {
  manufacturersState: Array<FilterData>;
  authorsState: Array<FilterData>;
  repositoriesState: Array<FilterData>;
  protocolsState: Array<FilterData>;
  onFilterChange: (sectionId: string, optionValue: string, checked: boolean) => void;
  onAddProtocol?: (protocol: FilterData) => void;
}

const SideBar: React.FC<SideBarProps> = ({
  manufacturersState,
  authorsState,
  repositoriesState,
  protocolsState,
  onFilterChange,
  onAddProtocol,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const filters = useMemo<Filters>(() => {
    const baseFilters: Filters = [
      { id: 'protocol', name: 'Protocol', options: protocolsState },
      { id: 'manufacturer', name: 'Manufacturer', options: manufacturersState },
      { id: 'author', name: 'Author', options: authorsState },
      { id: 'repository', name: 'Repository', options: repositoriesState },
    ];

    if (__DEPLOY_TYPE__ !== 'SERVER_AVAILABLE') {
      return baseFilters.filter((filter) => filter.id !== 'repository');
    }

    return baseFilters;
  }, [protocolsState, manufacturersState, authorsState, repositoriesState]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between border-b border-border-subtle pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Filters</h1>
      </div>

      <section aria-labelledby="products-heading" className="pb-15 pt-6">
        <div className="flex flex-col gap-x-8 gap-y-10">
          {/* Filters */}
          <form className="lg:block">
            {filters.map((section) => (
              <Disclosure key={section.id} as="div" className="border-b border-border-subtle py-6">
                <h3 className="flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-surface-canvas py-3 text-sm">
                    <span className="font-medium text-text-secondary">{section.name}</span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="size-5 text-icon-brand group-hover:text-interactive-hover group-data-[open]:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="hidden size-5 text-icon-brand group-hover:text-interactive-hover group-data-[open]:block"
                      />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="bg-surface-canvas pt-6">
                  {section.id === 'protocol' && __DEPLOY_TYPE__ !== 'SERVER_AVAILABLE' ? (
                    <p className="mb-4 text-sm text-text-primary">
                      Protocol filtering is only available when connected to a backend server.
                    </p>
                  ) : (
                    <FilterOptions
                      sectionId={section.id}
                      options={section.options}
                      onOptionChange={onFilterChange}
                      onAddProtocol={onAddProtocol}
                    />
                  )}
                </DisclosurePanel>
              </Disclosure>
            ))}
          </form>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {showScrollTop && (
              <div className="fixed bottom-8 left-8 z-50 pr-10">
                <Button
                  type="button"
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                  className="whitespace-nowrap border"
                  variant="default"
                >
                  <span className="inline-flex items-center gap-2 p-2">
                    <ChevronUpIcon className="size-6" aria-hidden="true" />
                    <span>Go back to top</span>
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SideBar;
