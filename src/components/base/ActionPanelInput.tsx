import React, { useState } from 'react';
import { getLocalStorage, setLocalStorage } from '../../utils/utils';
import { SETTINGS_URL_CATALOG } from '../../utils/constants';

const ActionPanelInput = () => {
  const [value, setValue] = useState(getLocalStorage(SETTINGS_URL_CATALOG));
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setLocalStorage(trimmed, SETTINGS_URL_CATALOG);
    setSavedUrl(trimmed);
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-base font-semibold text-textValue">
        Define the URL of the catalog where the TMC server is running
      </h3>
      <div className="mt-2 max-w-xl text-sm text-textLabel">
        <p>If the TMC server is running locally please add the port number to the URL.</p>
      </div>
      <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
        <div className="w-full sm:max-w-xs">
          <input
            id="urlCatalog"
            name="Catalog url"
            type="url"
            placeholder="e.g http://0.0.0.0:8080"
            aria-label="Catalog url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full rounded-md bg-inputBg px-3 py-1.5 text-base text-textValue outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-inputOnFocus sm:text-sm/6"
          />
        </div>
        <button
          type="submit"
          className="shadow-xs mt-3 inline-flex w-full items-center justify-center rounded-md bg-buttonPrimary px-3 py-2 text-sm font-semibold text-white hover:bg-buttonOnHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buttonFocus sm:ml-3 sm:mt-0 sm:w-auto"
        >
          Save
        </button>
      </form>
      {savedUrl && (
        <p className="mt-4 text-sm text-success" aria-live="polite">
          Saved URL: {savedUrl}
        </p>
      )}
    </div>
  );
};

export default ActionPanelInput;
