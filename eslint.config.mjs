import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const IDENTIFIER_LENGTH_RULE = [
  'error',
  {
    min: 3,
    exceptions: ['_', 'id'],
    properties: 'never',
  },
];

const BANNED_IDENTIFIERS = [
  'tmp',
  'obj',
  'val',
  'str',
  'num',
  'arr',
  'cb',
  'req',
  'res',
  'err',
  'idx',
  'cfg',
  'env',
  'ctx',
  'arg',
  'param',
  'prev',
  'props',
  'repo',
  'dto',
  'e',
  'i',
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/dev-dist/**',
      '**/prisma/migrations/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
    },
    rules: {
      'id-length': IDENTIFIER_LENGTH_RULE,
      'id-denylist': ['error', ...BANNED_IDENTIFIERS],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'has', 'can', 'should'],
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2023,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: { ...globals.browser },
    },
    plugins: { vue: vuePlugin },
    rules: {
      ...vuePlugin.configs['flat/recommended'].at(-1)?.rules,
      'id-length': IDENTIFIER_LENGTH_RULE,
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      'id-length': 'off',
      'id-denylist': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    files: ['**/prisma/seed.ts', '**/prisma/**/*.ts'],
    rules: {
      'id-length': 'off',
      'id-denylist': 'off',
    },
  },
);
