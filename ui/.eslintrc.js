module.exports = {
  "parser": "@babel/eslint-parser",
  "extends": ["airbnb", "plugin:react-hooks/recommended", "plugin:storybook/recommended"],
  // "plugins": ["jest"],
  "env": {
    "browser": true,
    "node": true,
  },
  "overrides": [
    {
      "files": [
        "**/*.test.js",
      ],
      "env": {
        "jest": true
      }
    }
  ],
  "rules": {
    "no-console": "off",
    "comma-dangle": "off",
    "no-underscore-dangle": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-props-no-spreading": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/prop-types": "off",
    "consistent-return": "off",
    "import/prefer-default-export": "off",
    "no-nested-ternary": "off",
    "no-restricted-syntax": "off",
    "no-plusplus": "off",
    "camelcase": "off",
    "jsx-a11y/alt-text": "warn",
    "react/jsx-props-no-multi-spaces": "off",
    "spaced-comment": ["error", "always", { "block": { "exceptions": ["*"] } }],
    "sort-imports": ["error", {
      "ignoreCase": false,
      "ignoreDeclarationSort": true,
      "ignoreMemberSort": true,
      "allowSeparatedGroups": true
    }],

    "react/jsx-no-bind": "off",
    "no-prototype-builtins": "off",

    "react/jsx-no-duplicate-props": ["error", { "ignoreCase": false }],

    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "after-used",
      "ignoreRestSiblings": true,
      "varsIgnorePattern": "_"
    }],

    "jsx-a11y/alt-text": "off"

  }
};
