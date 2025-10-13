// FIX: Replaced the vite/client reference which was causing a type resolution error.
// The project only needs a type definition for CSS module imports.
declare module '*.css';
