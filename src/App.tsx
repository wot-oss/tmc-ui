import React from 'react';
import ItemList from './components/ItemList';

const App = () => {
  return (
    <div className="flex max-h-screen w-screen flex-col">
      <h1 className="p-4 text-xl font-bold">list</h1>
      <ItemList />
    </div>
  );
};

export default App;
