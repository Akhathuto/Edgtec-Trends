// FIX: Replaced vite/client reference to resolve "Cannot find type definition file".
// This is likely a project setup issue, so this workaround manually defines `process.env.API_KEY` for TypeScript.
declare var process: {
  env: {
    API_KEY: string;
  };
};
