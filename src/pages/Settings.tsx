import React from 'react';
import GeneralSettings from '../components/GeneralSettings';

const Settings: React.FC = () => {
  return (
    <div className="bg-bgBodyPrimary flex min-h-dvh flex-col">
      <main className="py-10">
        <GeneralSettings />
      </main>
      <div className="flex-1"></div>
    </div>
  );
};

export default Settings;
