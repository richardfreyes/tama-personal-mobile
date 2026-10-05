const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const oneLineImportsRule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require every import declaration to remain on one physical line',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      multilineImport: 'Import declarations must be written on one physical line.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ImportDeclaration(node) {
        if (node.loc.start.line === node.loc.end.line) return;

        const importText = sourceCode.getText(node);
        context.report({
          node,
          messageId: 'multilineImport',
          fix: /\/\/|\/\*/.test(importText)
            ? null
            : fixer => fixer.replaceText(node, importText.replace(/\s*\r?\n\s*/g, ' ')),
        });
      },
    };
  },
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      local: {
        rules: {
          'one-line-imports': oneLineImportsRule,
        },
      },
    },
    rules: {
      'local/one-line-imports': 'error',
      'react-hooks/globals': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
]);
