import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

const Search: React.FC<{ 
  query:string, onSearch: (query: string) => void, filteredItems: Item[] }> = ({ query, onSearch, filteredItems }) => {
  

    

  return (
    <>
      <Combobox
        onChange={(item) => {
          console.log(item);
          //   if (item) {
          //     window.location = item.url;
          //   }
        }}
      >
        <div className="grid grid-cols-1">
          <ComboboxInput
            autoFocus
            className="outline-hidden col-start-1 row-start-1 h-12 w-full rounded-md bg-gray-900 pl-11 pr-4 text-base text-white placeholder:text-gray-500 sm:text-sm"
            placeholder="Search..."
            onChange={(event) => onSearch(event.target.value)}
            onBlur={() => onSearch('')}
          />
          <MagnifyingGlassIcon
            className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-500"
            aria-hidden="true"
          />
          {filteredItems.length > 0 && ( <p className='px-4 py-2'>Found {filteredItems.length} items</p>)}
          
        </div>

        {filteredItems.length > 0 && (
          <ComboboxOptions
            static
            className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-black"
          >
            {filteredItems.map((item, i) => {
               const key = `${item.tmName}:${item.repo}:${item['schema:mpn']}:row-${i}`;
              return (
              <ComboboxOption
                key={key}
                value={item}
                className="data-[focus]:bg-gray-900 data-[focus]:text-white data-[focus]:outline-none cursor-default select-none px-4 py-2"
              >
                {item.tmName}
              </ComboboxOption>
            )
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
