// eslint.config.js (Flat config for ESLint v9)
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  // Ignore generated/build outputs and reports
  {
    ignores: [
      "artifacts/**",
      "playwright-report/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/.pnpm/**",
    ],
  },

  // JS/TS rules
  {
    files: ["**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    rules: {
      // Prefer the TS-aware unused vars rule; allow `_`-prefixed
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Import hygiene & readability
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
        },
      ],
      // Workspaces + TS handle resolution
      "import/no-unresolved": "off",
    },
  },
];
