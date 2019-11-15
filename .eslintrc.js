module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:security/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  env: {
    es6: true,
    node: true,
    jest: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "security"],
  parserOptions: {
    ecmaVersion: 8,
    project: "./tsconfig.eslint.json"
  },
  rules: { "@typescript-eslint/require-await": 0 }
};
