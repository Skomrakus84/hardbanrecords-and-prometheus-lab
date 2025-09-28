// Plik: H:/Projekty/HardbanRecords-Lab/.eslintrc.cjs
module.exports = {
  root: true,
    root: true,
    env: { 
      browser: true, 
      es2022: true, 
      node: true, 
      jest: true 
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:jest/recommended',
      'prettier',
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },