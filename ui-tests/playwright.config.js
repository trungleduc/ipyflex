var baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  expect: {
    toMatchSnapshot: { threshold: 0.03 },
  },
  preserveOutput: 'failures-only',
  retries: 0,
};
