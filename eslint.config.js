const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    {
        ignores: ['eslint.config.js', 'node_modules/**'],
    },
    {
        files: ['**/*.js'],
        plugins: {
            prettier: prettier,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...prettierConfig.rules,
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'prettier/prettier': 'error',
        },
    },
];
