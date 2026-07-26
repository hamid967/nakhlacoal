// Standalone flat config used by `bun run lint:deadcode` in CI.
// Only rule enabled: unused-imports/no-unused-imports.
// Keeps dead-code enforcement independent of the general lint baseline
// (which still carries pre-existing @typescript-eslint/no-explicit-any debt).
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "unused-imports": unusedImports },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2020, sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
);
