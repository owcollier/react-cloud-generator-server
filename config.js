module.exports = {
    PORT: process.env.PORT || 8080,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    DATABASE_URL: 'mongodb:dev:dev@ds237967.mlab.com:37967/wordcloud-library'
    // 'mongodb://localhost/wordcloud-library'
};
