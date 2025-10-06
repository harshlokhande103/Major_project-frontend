const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');
const postcssNesting = require('postcss-nesting');

module.exports = {
  plugins: {
    tailwindcss: tailwindcss({}),
    autoprefixer: autoprefixer({}),
    'postcss-nesting': {},
  },
};