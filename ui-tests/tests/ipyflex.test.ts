import {
  expect,
  IJupyterLabPageFixture,
  galata,
  test
} from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

async function renderNotebook(fileName: string, page: IJupyterLabPageFixture) {
  const fullName = `example/${fileName}.ipynb`;
  await page.goto();
  await page.notebook.openByPath(fullName);
  await page.notebook.activate(fullName);
  await page.waitForTimeout(1000);
  await page.notebook.run();
  await page.notebook.waitForRun();
  const dashboard = await page.locator('div.lm-Widget.custom-widget');
  await page.waitForTimeout(1000);
  expect(dashboard).toBeDefined();
  expect(await dashboard!.screenshot()).toMatchSnapshot({
    name: `${fileName}.png`
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
  'WithWidgetsFactory'
];

test.describe('ipyflex Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 720 });
    page.on('console', message => {
      if (message.type() === 'error') {
        console.error('###########', message.text());
      }
    });
  });
  test.beforeAll(async ({ request }) => {
    const content = galata.newContentsHelper(request);
    await content.deleteDirectory('/example');
    await content.uploadDirectory(
      path.resolve(__dirname, '..', 'notebooks'),
      '/example'
    );
  });
  for (const name of notebookList) {
    test(`Render ${name}`, async ({ page }) => {
      await renderNotebook(name, page);
    });
  }
});
