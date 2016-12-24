require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Puzzles',
    description: 'Puzzles',
    head: {
      titleTemplate: 'Puzzles: %s',
      meta: [
        {name: 'description', content: 'Puzzles'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Puzzles'},
        {property: 'og:image', content: ''},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Puzzles'},
        {property: 'og:description', content: 'Puzzles'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: ''},
        {property: 'og:creator', content: ''},
        {property: 'twitter:card', content: 'summary' },
        {property: 'twitter:title', content: 'Puzzles' },
        {property: 'twitter:description', content: 'Puzzles'},
        {property: 'twitter:image', content: ''},
      ]
    }
  },

}, environment);
