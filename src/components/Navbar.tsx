import React, { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import logoLight from '../assets/tm-catalog-logo.svg';
import logoDark from '../assets/tm-catalog-logo-light.svg';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import { THEME_KEY } from '../utils/constants';

export interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

export interface UserNavItem {
  name: string;
  href: string;
}

const navigation = [{ name: 'Dashboard', href: '/', current: true }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null) || 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(stored);
    setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return (
    <Disclosure as="nav" className="border-b border-border bg-primaryNavbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex w-full">
            <div className="flex shrink-0 items-center">
              <img
                alt="Things model Catalog"
                className="h-14 w-auto"
                src={theme === 'dark' ? logoDark : logoLight}
              />
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
                        ? 'border-buttonBorder text-textWhite'
                        : 'border-transparent text-textGray hover:border-borderOnHover hover:text-textOnHover',
                      'inline-flex items-center border-b-8 px-1 pt-1 text-sm font-medium',
                    )}
                    end={item.href === '/'}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-md border border-buttonBorder px-3 py-2 text-sm font-medium text-textWhite hover:bg-buttonOnHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-buttonFocus"
                aria-label="Toggle theme"
              >
                <span className="inline-flex items-center gap-1.5">
                  {theme === 'dark' ? (
                    <MoonIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <SunIcon className="h-4 w-4" aria-hidden="true" />
                  )}

                  <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Navbar;
