'use client';

import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const navigation = {
  categories: [
    {
      id: 'women',
      name: 'Women',
      featured: [
        {
          name: 'New Arrivals',
          href: '#',
          imageSrc:
            'https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg',
          imageAlt:
            'Models sitting back to back, wearing Basic Tee in black and bone.',
        },
        {
          name: 'Basic Tees',
          href: '#',
          imageSrc:
            'https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg',
          imageAlt:
            'Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Tops', href: '#' },
            { name: 'Dresses', href: '#' },
            { name: 'Pants', href: '#' },
            { name: 'Denim', href: '#' },
            { name: 'Sweaters', href: '#' },
            { name: 'T-Shirts', href: '#' },
            { name: 'Jackets', href: '#' },
            { name: 'Activewear', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '#' },
            { name: 'Wallets', href: '#' },
            { name: 'Bags', href: '#' },
            { name: 'Sunglasses', href: '#' },
            { name: 'Hats', href: '#' },
            { name: 'Belts', href: '#' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Full Nelson', href: '#' },
            { name: 'My Way', href: '#' },
            { name: 'Re-Arranged', href: '#' },
            { name: 'Counterfeit', href: '#' },
            { name: 'Significant Other', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'men',
      name: 'Men',
      featured: [
        {
          name: 'New Arrivals',
          href: '#',
          imageSrc:
            'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg',
          imageAlt:
            'Drawstring top with elastic loop closure and textured interior padding.',
        },
        {
          name: 'Artwork Tees',
          href: '#',
          imageSrc:
            'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg',
          imageAlt:
            'Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Tops', href: '#' },
            { name: 'Pants', href: '#' },
            { name: 'Sweaters', href: '#' },
            { name: 'T-Shirts', href: '#' },
            { name: 'Jackets', href: '#' },
            { name: 'Activewear', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '#' },
            { name: 'Wallets', href: '#' },
            { name: 'Bags', href: '#' },
            { name: 'Sunglasses', href: '#' },
            { name: 'Hats', href: '#' },
            { name: 'Belts', href: '#' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Re-Arranged', href: '#' },
            { name: 'Counterfeit', href: '#' },
            { name: 'Full Nelson', href: '#' },
            { name: 'My Way', href: '#' },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'Company', href: '#' },
    { name: 'Stores', href: '#' },
  ],
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menCategory = navigation.categories.find((c) => c.id === 'men');
  const womenCategory = navigation.categories.find((c) => c.id === 'women');

  return (
    <div className="sticky top-0 bg-white">
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 transition-opacity duration-300 ease-linear bg-black/25 data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex flex-col w-full max-w-xs pb-12 overflow-y-auto transition duration-300 ease-in-out transform bg-white shadow-xl data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative inline-flex items-center justify-center p-2 -m-2 text-gray-400 rounded-md"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="flex px-4 -mb-px space-x-8">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 px-1 py-4 text-base font-medium text-gray-900 border-b-2 border-transparent whitespace-nowrap data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel
                    key={category.name}
                    className="px-4 pt-10 pb-8 space-y-10"
                  >
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="relative text-sm group">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="object-cover w-full bg-gray-100 rounded-lg aspect-square group-hover:opacity-75"
                          />
                          <a
                            href={item.href}
                            className="block mt-6 font-medium text-gray-900"
                          >
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 z-10"
                            />
                            {item.name}
                          </a>
                          <p aria-hidden="true" className="mt-1">
                            Shop now
                          </p>
                        </div>
                      ))}
                    </div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p
                          id={`${category.id}-${section.id}-heading-mobile`}
                          className="font-medium text-gray-900"
                        >
                          {section.name}
                        </p>
                        <ul
                          role="list"
                          aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                          className="flex flex-col mt-6 space-y-6"
                        >
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="block p-2 -m-2 text-gray-500"
                              >
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="px-4 py-6 space-y-6 border-t border-gray-200">
              {navigation.pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <a
                    href={page.href}
                    className="block p-2 -m-2 font-medium text-gray-900"
                  >
                    {page.name}
                  </a>
                </div>
              ))}
            </div>

            <div className="px-4 py-6 space-y-6 border-t border-gray-200">
              <div className="flow-root">
                <a
                  href="#"
                  className="block p-2 -m-2 font-medium text-gray-900"
                >
                  Sign in
                </a>
              </div>
              <div className="flow-root">
                <a
                  href="#"
                  className="block p-2 -m-2 font-medium text-gray-900"
                >
                  Create account
                </a>
              </div>
            </div>

            <div className="px-4 py-6 border-t border-gray-200">
              <a href="#" className="flex items-center p-2 -m-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                  className="block w-5 h-auto shrink-0"
                />
                <span className="block ml-3 text-base font-medium text-gray-900">
                  CAD
                </span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        <p className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-indigo-600 sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>

        <nav
          aria-label="Top"
          className="justify-between max-w-full px-4 mx-auto sm:px-6 lg:px-8"
        >
          <div className="border-b border-gray-200 lg:px-20">
            <div className="flex items-center justify-between h-16">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative p-2 text-gray-400 bg-white rounded-md lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Logo */}
              <div className="flex lg:ml-0">
                <a href="#">
                  <span className="sr-only">Your Company</span>
                  <Image
                    src={require('../../assets/logo.png')}
                    alt="Your Company"
                    className="w-20 h-20"
                    priority
                  />{' '}
                </a>
              </div>

              {/* Desktop menu to match layout: MEN, WOMEN, KIDS, HOME, BEAUTY, GENZ, STUDIO NEW */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex items-center h-full space-x-6">
                  {womenCategory && (
                    <Popover key="women" className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative flex items-center justify-center text-sm font-semibold tracking-wide text-gray-800 transition-colors duration-200 ease-out group hover:text-gray-900 data-open:text-indigo-600">
                          WOMEN
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-indigo-600"
                          />
                        </PopoverButton>
                      </div>
                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 z-20 w-full text-sm text-gray-500 transition bg-white top-full data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-white shadow-sm top-1/2"
                        />
                        <div className="relative bg-white">
                          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 py-16 gap-x-8 gap-y-10">
                              <div className="grid grid-cols-2 col-start-2 gap-x-8">
                                {womenCategory.featured.map((item) => (
                                  <div
                                    key={item.name}
                                    className="relative text-base group sm:text-sm"
                                  >
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="object-cover w-full bg-gray-100 rounded-lg aspect-square group-hover:opacity-75"
                                    />
                                    <a
                                      href={item.href}
                                      className="block mt-6 font-medium text-gray-900"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="absolute inset-0 z-10"
                                      />
                                      {item.name}
                                    </a>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-3 row-start-1 text-sm gap-x-8 gap-y-10">
                                {womenCategory.sections.map((section) => (
                                  <div key={section.name}>
                                    <p
                                      id={`${section.name}-heading`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <a
                                            href={item.href}
                                            className="hover:text-gray-800"
                                          >
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  )}

                  {menCategory && (
                    <Popover key="men" className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative flex items-center justify-center text-sm font-semibold tracking-wide text-gray-800 transition-colors duration-200 ease-out group hover:text-gray-900 data-open:text-indigo-600">
                          MEN
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-indigo-600"
                          />
                        </PopoverButton>
                      </div>
                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 z-20 w-full text-sm text-gray-500 transition bg-white top-full data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-white shadow-sm top-1/2"
                        />
                        <div className="relative bg-white">
                          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 py-16 gap-x-8 gap-y-10">
                              <div className="grid grid-cols-2 col-start-2 gap-x-8">
                                {menCategory.featured.map((item) => (
                                  <div
                                    key={item.name}
                                    className="relative text-base group sm:text-sm"
                                  >
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="object-cover w-full bg-gray-100 rounded-lg aspect-square group-hover:opacity-75"
                                    />
                                    <a
                                      href={item.href}
                                      className="block mt-6 font-medium text-gray-900"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="absolute inset-0 z-10"
                                      />
                                      {item.name}
                                    </a>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-3 row-start-1 text-sm gap-x-8 gap-y-10">
                                {menCategory.sections.map((section) => (
                                  <div key={section.name}>
                                    <p
                                      id={`${section.name}-heading`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <a
                                            href={item.href}
                                            className="hover:text-gray-800"
                                          >
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  )}

                  {/* Simple section links */}
                  <a
                    href="#"
                    className="text-sm font-semibold tracking-wide text-gray-800 hover:text-gray-900"
                  >
                    KIDS
                  </a>
                  <a
                    href="#"
                    className="text-sm font-semibold tracking-wide text-gray-800 hover:text-gray-900"
                  >
                    HOME
                  </a>
                </div>
              </PopoverGroup>

              {/* Center search bar */}

              <div className="items-center hidden ml-auto space-x-8 lg:flex">
                <div className="justify-center flex-1 hidden px-4 md:flex">
                  <div className="relative w-full max-w-xl">
                    <MagnifyingGlassIcon className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 size-5" />
                    <input
                      type="text"
                      placeholder="Search for products, brands and more"
                      className="w-full rounded-lg bg-gray-100 pl-14  pr-72 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none ring-1 ring-gray-100 focus:ring-gray-200"
                    />
                  </div>
                </div>
                <a
                  href="/login"
                  className="flex flex-col items-center text-gray-700 hover:text-gray-900"
                >
                  <UserIcon aria-hidden="true" className="size-6" />
                  <span className="mt-1 text-xs">Profile</span>
                </a>
                <a
                  href="#"
                  className="flex flex-col items-center text-gray-700 hover:text-gray-900"
                >
                  <HeartIcon aria-hidden="true" className="size-6" />
                  <span className="mt-1 text-xs">Wishlist</span>
                </a>
                <a
                  href="#"
                  className="flex flex-col items-center text-gray-700 hover:text-gray-900"
                >
                  <ShoppingBagIcon aria-hidden="true" className="size-6" />
                  <span className="mt-1 text-xs">Bag</span>
                </a>
              </div>

              {/* Mobile search and cart (preserve) */}
              <div className="flex items-center ml-auto lg:hidden">
                <a href="#" className="p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Search</span>
                  <MagnifyingGlassIcon aria-hidden="true" className="size-6" />
                </a>
                <a href="#" className="flex items-center p-2 ml-2 -m-2 group">
                  <ShoppingBagIcon
                    aria-hidden="true"
                    className="text-gray-400 size-6 shrink-0 group-hover:text-gray-500"
                  />
                  <span className="sr-only">View bag</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
