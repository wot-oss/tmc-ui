import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useRef } from 'react';

const Search: React.FC<{
  query: string;
  onSearch: (query: string) => void;
  filteredItems: Item[];
}> = ({ query, onSearch, filteredItems }) => {
  const [displayOptions, setDisplayOptions] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Combobox value={selected} onChange={(val: Item | null) => setSelected(val)}>
        <div className="relative">
          <ComboboxInput
            ref={inputRef}
            autoFocus
            value={query}
            className="h-12 w-full rounded-md bg-gray-900 pl-11 pr-4 text-base text-white placeholder:text-gray-500 sm:text-sm"
            placeholder="Search..."
            onChange={(event) => onSearch(event.target.value)}
          />
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onSearch('');
                setSelected(null);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <XMarkIcon className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {displayOptions && filteredItems.length > 0 && (
          <ComboboxOptions
            static
            className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-black"
          >
            <ComboboxOption
              key="__count"
              value={selected as any}
              className="cursor-default select-none px-4 py-2 data-[focus]:bg-gray-900 data-[focus]:text-white data-[focus]:outline-none"
            >
              Found {filteredItems.length} items
            </ComboboxOption>
            {filteredItems.map((item, i) => {
              const key = `${item.tmName}:${item.repo}:${item['schema:mpn']}:row-${i}`;
              return (
                <ComboboxOption
                  key={key}
                  value={item}
                  className="cursor-default select-none px-4 py-2 data-[focus]:bg-gray-900 data-[focus]:text-white data-[focus]:outline-none"
                >
                  {item.tmName}
                </ComboboxOption>
              );
            })}
          </ComboboxOptions>
        )}

        {query !== '' && filteredItems.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No thing modals found.</p>
        )}
      </Combobox>
    </>
  );
};

export default Search;
