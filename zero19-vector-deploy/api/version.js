const pkg = require('../package.json');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  return res.status(200).json({
    version: pkg.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA
      ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
      : null,
    environment: process.env.VERCEL_ENV || null,
    checkedAt: new Date().toISOString(),
  });
};
