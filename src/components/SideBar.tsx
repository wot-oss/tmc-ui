import React, { useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

interface SideBarProps {
  manufacturersState: Array<{ value: string; label: string; checked: boolean }>;
  authorsState: Array<{ value: string; label: string; checked: boolean }>;
  catalogsState: Array<{ value: string; label: string; checked: boolean }>;
  onFilterChange: (sectionId: string, optionValue: string, checked: boolean) => void;
}

const SideBar: React.FC<SideBarProps> = ({
  manufacturersState,
  authorsState,
  catalogsState,
  onFilterChange,
}) => {
  const filters = useMemo<Filters>(
    () => [
      { id: 'protocol', name: 'Protocol', options: [] },
      { id: 'manufacturer', name: 'Manufacturer', options: manufacturersState },
      { id: 'author', name: 'Author', options: authorsState },
      { id: 'repository', name: 'Repository', options: catalogsState },
    ],
    [manufacturersState, authorsState, catalogsState],
  );

  return (
    <div className="w-full bg-white">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Filters</h1>
      </div>

      <section aria-labelledby="products-heading" className="pb-24 pt-6">
        <h2 id="products-heading" className="sr-only">
          Products
        </h2>

        <div className="flex flex-col gap-x-8 gap-y-10">
          {/* Filters */}
          <form className="hidden lg:block">
            {filters.map((section) => (
              <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6">
                <h3 className="-my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                    <span className="font-medium text-gray-900">{section.name}</span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon aria-hidden="true" className="group-data-open:hidden size-5" />
                      <MinusIcon aria-hidden="true" className="group-not-data-open:hidden size-5" />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="pt-6">
                  <div className="space-y-4">
                    {section.options.map((option, optionIdx) => (
                      <div key={option.value} className="flex gap-3">
                        <div className="flex h-5 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              id={`filter-${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              value={option.value}
                              checked={option.checked}
                              type="checkbox"
                              onChange={(e) =>
                                onFilterChange(section.id, option.value, e.target.checked)
                              }
                              className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="group-has-disabled:stroke-gray-950/25 pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-[:checked]:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <label
                          htmlFor={`filter-${section.id}-${optionIdx}`}
                          className="text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </form>

          {/* Product grid */}
          <div className="lg:col-span-3">{/* Your content */}</div>
        </div>
      </section>
    </div>
  );
};

export default SideBar;
