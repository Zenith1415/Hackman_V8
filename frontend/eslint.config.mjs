import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Allow unused variables prefixed with _ (common in catches/React deps)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      // Relax exhaustive-deps warnings (we intentionally manage deps in some effects)
      "react-hooks/exhaustive-deps": "warn",
      // Allow <img> usage temporarily (Next/Image migration later)
      "@next/next/no-img-element": "off",
      // Prefer-const as warning not error
      "prefer-const": "warn"
    }
  },
];

export default eslintConfig;
