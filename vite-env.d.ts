// FIX: Replaced the reference to "vite/client" with a specific module declaration
// for CSS files. This resolves the "Cannot find type definition file" error, which
// is likely caused by an environment setup issue, and prevents further type errors
// related to CSS imports.
declare module '*.css';
