var baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 10 * 1000,
    reuseExistingServer: false
  },
  expect: {
    toMatchSnapshot: { maxDiffPixelRatio: 0.03 }
  },
  preserveOutput: 'failures-only',
  retries: 0
};
