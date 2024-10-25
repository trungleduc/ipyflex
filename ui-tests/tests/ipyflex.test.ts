import { galata, IJupyterLabPageFixture, test } from '@jupyterlab/galata';
import { expect } from '@playwright/test';

async function renderNotebook(fileName: string, page: IJupyterLabPageFixture) {
  const fullName = `./${fileName}.ipynb`;
  await page.notebook.openByPath(fullName);
  await page.notebook.activate(fullName);
  await page.notebook.run();
  await page.notebook.waitForRun();
  const dashboard = await page.$('div.lm-Widget.p-Widget.custom-widget');
  await new Promise((_) => setTimeout(_, 1000));
  expect(await dashboard.screenshot()).toMatchSnapshot({
    name: `${fileName}.png`,
  });
}

const notebookList = [
  'CustomHeader',
  'CustomStyle',
  'DashboardWithHeader',
  'EmptyDashboard',
  'MultipleSections',
  'PlaceholderWidgets',
  'WithWidgets',
  'WithWidgetsFactory',
];

test.describe('ipyflex Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 720 });
  });
  for (const name of notebookList) {
    test(`Render ${name}`, async ({ page }) => {
      await renderNotebook(name, page);
    });
  }
});
