import React, { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import logoLight from '../assets/tm-catalog-logo.svg';
import logoDark from '../assets/tm-catalog-logo-light.svg';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import { getStoredTheme, togglePreferredTheme, type ThemeName } from '../utils/theme';
import Button from './base/Button';

export interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

export interface UserNavItem {
  name: string;
  href: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Navbar: React.FC<{ isServerDeployment: boolean }> = ({ isServerDeployment }) => {
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeName>(() => getStoredTheme());

  const toggleTheme = () => {
    setTheme((currentTheme) => togglePreferredTheme(currentTheme));
  };

  let navigation: NavItem[] = [];

  if (!isServerDeployment) {
    navigation = [
      { name: 'Dashboard', href: '/', current: true },
      { name: 'Settings', href: '/settings', current: false },
    ];
  } else {
    navigation = [{ name: 'Dashboard', href: '/', current: true }];
  }

  return (
    <Disclosure as="nav" className="border-b border-surface-panel-hover bg-surface-panel">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex w-full items-center justify-between gap-6">
            <div className="flex shrink-0 items-center">
              <img
                alt="Things model Catalog"
                className="h-14 w-auto"
                src={theme === 'dark' ? logoDark : logoLight}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-full sm:-my-px">
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
                          ? 'border-border-interactive-pressed bg-transparent text-text-primary'
                          : 'border-border-default text-text-secondary hover:bg-surface-panel-hover hover:text-text-primary',
                        "relative flex items-center justify-center border-b-[3px] px-4 py-1 text-sm font-medium before:pointer-events-none before:absolute before:inset-0 before:rounded-[2px] before:border before:border-focus-ring before:opacity-0 before:content-[''] focus-visible:outline-none focus-visible:before:opacity-100",
                      )}
                      end={item.href === '/'}
                    >
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
              <Button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="border pl-4 pr-4"
                variant="default"
              >
                <span className="inline-flex items-center gap-1.5">
                  {theme === 'dark' ? (
                    <MoonIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <SunIcon className="h-4 w-4" aria-hidden="true" />
                  )}

                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Navbar;
