module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'sonarjs',
    'jest',
    'eslint-plugin-import',
    'eslint-plugin-unicorn',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended-legacy',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    "@typescript-eslint/lines-between-class-members": ["error", "always"],
    '@typescript-eslint/no-unsafe-call': 'error',


    'no-console': 'error',
    'no-unused-vars': 'error',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    'arrow-body-style': ['error', 'always'],
    'no-restricted-syntax': 'off',

    'sonarjs/cognitive-complexity': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',

    'jest/no-disabled-tests': 'error',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',

    'import/extensions': ['error', 'ignorePackages', { 'ts': 'never', 'tsx': 'never' }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': true }],

    'unicorn/filename-case': ['error', { 'case': 'kebabCase' }],

    'import/order': [
      2,
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'unknown',
          'object',
          'type',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],


    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: ['StrictPascalCase', 'strictCamelCase'] },
      {
        selector: 'variable',
        format: ['strictCamelCase', 'UPPER_CASE', 'StrictPascalCase'],
      },
      {
        selector: 'parameter',
        modifiers: ['unused'],
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
      },
      { selector: 'property', format: null },
      { selector: 'typeProperty', format: null },
      { selector: 'typeLike', format: ['StrictPascalCase'] },
    ],
  },

};
