module.exports = {
    PORT: process.env.PORT || 8080,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    DATABASE_URL: 'mongodb://dev:dev@ds237967.mlab.com:37967/wordcloud-library',
    TEST_DATABASE_URL: 'mongodb://dev:dev@ds241677.mlab.com:41677/test-db-wordcloud'
    // 'mongodb://localhost/wordcloud-library'
};
