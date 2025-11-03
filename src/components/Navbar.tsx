import React from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';

export interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

export interface UserNavItem {
  name: string;
  href: string;
}

export interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

const navigation = [{ name: 'Dashboard', href: '#', current: true }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar: React.FC = () => {
  return (
    <Disclosure as="nav" className="border-b border-white/10 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <img
                alt="Things model Catalog"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-400 hover:border-white/20 hover:text-gray-200',
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                  )}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center"></div>
          <div className="-mr-2 flex items-center sm:hidden"></div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300'
                  : 'border-transparent text-gray-400 hover:border-gray-500 hover:bg-white/5 hover:text-gray-200',
                'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-gray-700 pb-3 pt-4">
          <div className="flex items-center px-4"></div>
          <div className="mt-3 space-y-1"></div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;
