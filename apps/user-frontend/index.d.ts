/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

// Temporary shim to silence TS resolution issues for the installed package
// (the runtime module and its types exist under node_modules/@headlessui/react)
declare module '@headlessui/react';
