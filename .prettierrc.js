module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  doubleQuote: false,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 80,
  
  // Brackets and spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // Overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
