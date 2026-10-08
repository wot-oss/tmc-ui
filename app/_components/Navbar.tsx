'use client';
import { Disclosure } from '@headlessui/react';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import Button from './base/Button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THEME_KEY } from '../../lib/utils/constants';

type Theme = 'light' | 'dark';

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

export function Navbar({ isAuthenticationEnabled }: { isAuthenticationEnabled: boolean }) {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme: Theme = root.dataset.theme === 'light' ? 'dark' : 'light';

    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    root.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  let navigation: NavItem[] = [];

  if (isAuthenticationEnabled) {
    navigation = [
      { name: 'Dashboard', href: '/', current: true },
      { name: 'API Authentication', href: '/settings', current: false },
    ];
  } else {
    navigation = [{ name: 'Dashboard', href: '/', current: true }];
  }

  return (
    <Disclosure as="nav" className="border-surface-panel-hover bg-surface-panel border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex w-full items-center justify-between gap-6">
            <Link href="/" className="flex shrink-0 items-center">
              <img
                alt="Things model Catalog"
                className="theme-dark-only h-14 w-auto"
                src="/tm-catalog-logo-light.svg"
              />
              <img
                alt="Things model Catalog"
                className="theme-light-only h-14 w-auto"
                src="/tm-catalog-logo.svg"
              />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-full sm:-my-px">
                {navigation.map((item) => {
                  const isActive =
                    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? 'border-border-interactive-pressed text-text-primary bg-transparent'
                          : 'border-border-default text-text-secondary hover:bg-surface-panel-hover hover:text-text-primary',
                        "before:border-focus-ring relative flex items-center justify-center border-b-[3px] px-4 py-1 text-sm font-medium before:pointer-events-none before:absolute before:inset-0 before:rounded-xs before:border before:opacity-0 before:content-[''] focus-visible:outline-none focus-visible:before:opacity-100",
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <Button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="border pr-4 pl-4"
                variant="default"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="theme-dark-only inline-flex items-center gap-1.5">
                    <SunIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Light</span>
                  </span>
                  <span className="theme-light-only items-center gap-1.5">
                    <MoonIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Dark</span>
                  </span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
