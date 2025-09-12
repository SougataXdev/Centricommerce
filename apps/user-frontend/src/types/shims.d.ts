declare module '@headlessui/react' {
  // Re-export everything as any to satisfy TS in this app context
  const content: any
  export default content
  export const Dialog: any
  export const DialogBackdrop: any
  export const DialogPanel: any
  export const Popover: any
  export const PopoverButton: any
  export const PopoverGroup: any
  export const PopoverPanel: any
  export const Tab: any
  export const TabGroup: any
  export const TabList: any
  export const TabPanels: any
  export const TabPanel: any
}
