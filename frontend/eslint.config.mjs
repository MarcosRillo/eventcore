import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import jsdoc from "eslint-plugin-jsdoc";
import checkFile from "eslint-plugin-check-file";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
  // Global ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "next-env.d.ts",
    ],
  },

  // Next.js plugin - global registration (no files pattern = applies to all)
  // This is required for Next.js build to detect the plugin via calculateConfigForFile
  {
    plugins: {
      "@next/next": nextPlugin,
    },
  },

  // Next.js rules for JS/JSX/TS/TSX files only
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      ...nextPlugin.flatConfig.coreWebVitals.rules,
    },
  },

  // TypeScript/TSX files configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      jsdoc,
      "check-file": checkFile,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules (jsx-a11y)
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",

      // Console statements: ERROR (CLAUDE.md compliance)
      "no-console": "error",

      // Relative imports: ERROR (CLAUDE.md compliance)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message: "CLAUDE.md: Use path aliases (@/*) instead of relative imports. Relative imports break modularity."
            }
          ]
        }
      ],

      // Replace import/order with simple-import-sort for auto-fix
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Auto-remove unused imports (replaces @typescript-eslint/no-unused-vars for imports)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],

      // JSDoc documentation - DISABLED temporarily
      // Next.js 15 treats warnings as errors in build
      // TODO: Enable when codebase is documented
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off"
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        }
      }
    }
  },

  // Component files: PascalCase naming convention
  {
    files: ["src/features/**/components/**/*.tsx"],
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.tsx": "PASCAL_CASE" },
        { ignoreMiddleExtensions: true }
      ],
    },
  },

  // Feature folders: kebab-case naming convention (excluding __tests__ folders)
  {
    files: ["src/features/**/*"],
    ignores: ["**/__tests__/**"],
    rules: {
      "check-file/folder-naming-convention": [
        "error",
        { "src/features/**/!(__tests__)/": "KEBAB_CASE" }
      ],
    },
  },

  // Exceptions for relative imports
  {
    files: ["**/index.ts", "**/index.tsx"],
    rules: {
      "no-restricted-imports": "off" // Barrel exports can use ./*
    }
  },
  {
    files: ["**/__tests__/page.test.tsx"],
    rules: {
      "no-restricted-imports": "off" // Page tests can import ../page
    }
  },
  {
    files: ["src/app/layout.tsx"],
    rules: {
      "no-restricted-imports": "off" // Layout can import ./globals.css
    }
  },
  {
    files: ["e2e/**/*.ts"],
    rules: {
      "no-restricted-imports": "off" // E2E tests are outside src/ and cannot use @/ aliases
    }
  },
  {
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      // Block ALL console.* in tests - no debugging statements allowed
      "no-console": "error"
    }
  },
  {
    files: ["e2e/**"],
    rules: {
      // Allow console in E2E setup/tests (Playwright global-setup needs logging)
      "no-console": "off",
      // E2E tests use Playwright's own import patterns
      "simple-import-sort/imports": "off"
    }
  }
];

export default eslintConfig;
