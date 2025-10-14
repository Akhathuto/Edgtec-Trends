// FIX: This file previously contained `/// <reference types="vite/client" />` which was causing a TypeScript error
// because the type definitions could not be found. This is likely due to a missing 'vite' dependency or a
// misconfigured tsconfig.json. Since no Vite-specific client features (like import.meta.env) are used
// in the app, this reference has been removed to resolve the error. If Vite client features are added
// in the future, the project's setup should be revisited to ensure dependencies are correct.
