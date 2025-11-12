import React from 'react';
import ActionPanelInput from './base/ActionPanelInput';

const GeneralSettings: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">General Settings</h1>
      <div className="rounded-lg shadow-sm">
        <p className="text-sm text-gray-600">
          Update your settings for the catalog to be available.
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ActionPanelInput></ActionPanelInput>
      </div>
    </div>
  );
};

export default GeneralSettings;
