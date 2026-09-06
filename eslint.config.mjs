import js from "@eslint/js";
import globals from "globals";
export default [
  { ignores: ["node_modules/**", "dist/**"] },
  {
    files: ["src/**/*.js"],
    languageOptions: { globals: globals.browser, sourceType: "module" },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^previousStep$" }],
    },
  },
  {
    files: ["tools/**/*.mjs", "eslint.config.mjs"],
    languageOptions: { globals: globals.node, sourceType: "module" },
    rules: js.configs.recommended.rules,
  },
];
