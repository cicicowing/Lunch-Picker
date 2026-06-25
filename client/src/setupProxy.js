const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // In development, proxy API calls to backend
  // In production, REACT_APP_API_URL will be used instead
  if (!process.env.REACT_APP_API_URL) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5000',
        changeOrigin: true,
      })
    );
  }
};
