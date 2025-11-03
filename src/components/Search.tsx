import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

const people = [
  { id: 1, name: 'Leslie Alexander', url: '#' },
  // More people...
];
const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);

  const filteredItems =
    query === ''
      ? []
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <Combobox
        onChange={(person) => {
          //   if (person) {
          //     window.location = person.url;
          //   }
        }}
      >
        <div className="grid grid-cols-1">
          <ComboboxInput
            autoFocus
            className="outline-hidden col-start-1 row-start-1 h-12 w-full rounded-md bg-gray-900 pl-11 pr-4 text-base text-white placeholder:text-gray-500 sm:text-sm"
            placeholder="Search..."
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
          />
          <MagnifyingGlassIcon
            className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-500"
            aria-hidden="true"
          />
        </div>

        {filteredItems.length > 0 && (
          <ComboboxOptions
            static
            className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-300"
          >
            {filteredItems.map((person) => (
              <ComboboxOption
                key={person.id}
                value={person}
                className="data-focus:bg-indigo-500 data-focus:text-white data-focus:outline-hidden cursor-default select-none px-4 py-2"
              >
                {person.name}
              </ComboboxOption>
            ))}
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
