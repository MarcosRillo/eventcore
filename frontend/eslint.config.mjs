import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      jsdoc,
    },
    rules: {
      // Console statements: ERROR (Fase 3 completada)
      // NO permite ningún console.* (ni log, ni warn, ni error)
      "no-console": "error",

      // Relative imports: ERROR (Fase 3 completada)
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

      // Import ordering (organización de imports): ERROR (Fase 3 completada)
      "import/order": [
        "error",
        {
          groups: [
            "builtin",   // Node.js built-ins
            "external",  // npm packages
            "internal",  // @/* aliases
            "parent",    // ../
            "sibling",   // ./
            "index"      // ./index
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],

      // JSDoc documentation (funciones públicas)
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false
          },
          exemptEmptyFunctions: true
        }
      ],
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-param-type": "off",  // TypeScript ya provee types
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
  // Excepciones legítimas para relative imports
  {
    files: ["**/index.ts", "**/index.tsx"],
    rules: {
      "no-restricted-imports": "off" // Barrel exports pueden usar ./*
    }
  },
  {
    files: ["**/__tests__/page.test.tsx"],
    rules: {
      "no-restricted-imports": "off" // Page tests pueden importar ../page
    }
  },
  {
    files: ["src/app/layout.tsx"],
    rules: {
      "no-restricted-imports": "off" // Layout puede importar ./globals.css
    }
  },
  {
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-console": "off" // Tests pueden usar console para debugging
    }
  }
];

export default eslintConfig;
