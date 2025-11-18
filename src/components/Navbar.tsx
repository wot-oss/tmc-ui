import React from 'react';
import { Disclosure } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/tm-catalog-logo.svg';

export interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

export interface UserNavItem {
  name: string;
  href: string;
}

const navigation = [
  { name: 'Thing Model Catalog Dashboard', href: '/', current: true },
  { name: 'Settings', href: '/settings', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <Disclosure as="nav" className="border-b border-white/10 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex w-full">
            <div className="flex shrink-0 items-center">
              <img alt="Things model Catalog" src={logo} className="h-14 w-auto" />
            </div>
            <div className="flex sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href);
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-gray-400 hover:border-white/20 hover:text-gray-200',
                      'inline-flex items-center border-b-8 px-1 pt-1 text-sm font-medium',
                    )}
                    end={item.href === '/'}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center"></div>
          <div className="mr-2 flex items-center sm:hidden"></div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Navbar;
