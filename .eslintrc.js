module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'no-use-before-define': ['error', {'functions': false}],
    'no-restricted-syntax': [0, 'ForOfStatement'],
    'no-await-in-loop': [0],
  },
};
