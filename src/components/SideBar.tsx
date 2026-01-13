import React, { useMemo, useState, useEffect } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import FilterOptions from './FilterOptions';

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

  const filters = useMemo<Filters>(
    () => [
      { id: 'protocol', name: 'Protocol', options: protocolsState },
      { id: 'manufacturer', name: 'Manufacturer', options: manufacturersState },
      { id: 'author', name: 'Author', options: authorsState },
      { id: 'repository', name: 'Repository', options: repositoriesState },
    ],
    [protocolsState, manufacturersState, authorsState, repositoriesState],
  );

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
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textValue">Filters</h1>
      </div>

      <section aria-labelledby="products-heading" className="pb-24 pt-6">
        <div className="flex flex-col gap-x-8 gap-y-10">
          {/* Filters */}
          <form className="hidden lg:block">
            {filters.map((section) => (
              <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6">
                <h3 className="-my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-bgBodyPrimary py-3 text-sm">
                    <span className="font-medium text-textLabel">{section.name}</span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="group-hover:buttonOnHover size-5 text-buttonPrimary group-data-[open]:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="group-hover:buttonOnHover hidden size-5 text-buttonPrimary group-data-[open]:block"
                      />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="bg-bgBodyPrimary pt-6">
                  <FilterOptions
                    sectionId={section.id}
                    options={section.options}
                    onOptionChange={onFilterChange}
                    onAddProtocol={onAddProtocol}
                  />
                </DisclosurePanel>
              </Disclosure>
            ))}
          </form>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {showScrollTop && (
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className="fixed bottom-8 left-8 z-50 flex items-center gap-2 whitespace-nowrap rounded-full bg-buttonPrimary px-4 py-3 text-sm font-medium text-textWhite shadow-lg transition-opacity hover:bg-buttonOnHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buttonFocus"
              >
                <ChevronUpIcon className="size-6" aria-hidden="true" />
                <span>Go back to top</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SideBar;
