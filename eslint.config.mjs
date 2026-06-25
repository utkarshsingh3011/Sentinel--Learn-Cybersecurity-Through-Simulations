// ==========================================
// ESLint Configuration
// SENTINEL - Interactive Cybersecurity Learning Platform
// ==========================================

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  // Next.js Recommended Rules
  ...nextVitals,

  // TypeScript Support
  ...nextTypeScript,

  // Ignore generated files and build output
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
