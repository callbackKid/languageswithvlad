// Drives the app in Chrome against `yarn dev`, once per theme, with /api/* answered by fixtures.mjs.
// Steps come on stdin, one per line (see SKILL.md). After the run: console errors and pages that
// scroll sideways are reported, and the exit code is 1 if there were any.
//
// node .claude/skills/run-languageswithvlad/driver.mjs [--width 390] [--themes light,dark] [--out dir] < steps
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { answerFor, DOCUMENT_ID } from './fixtures.mjs';

// playwright-core is installed outside the repo (SKILL.md, Setup), so the project keeps no browser dependency
const PLAYWRIGHT_DIR =
  process.env.PLAYWRIGHT_DIR || join(homedir(), '.cache', 'languageswithvlad-playwright');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
// how long a click or wait may take before the step fails; Vite compiles pages on first visit
const STEP_TIMEOUT = 15_000;

const options = {
  width: '390',
  themes: 'light,dark',
  out: join(tmpdir(), 'languageswithvlad-shots'),
};
const argumentList = process.argv.slice(2);
for (let index = 0; index < argumentList.length; index += 2)
  options[argumentList[index].replace(/^--/, '')] = argumentList[index + 1];
mkdirSync(options.out, { recursive: true });

const steps = readFileSync(0, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const { chromium } = createRequire(join(PLAYWRIGHT_DIR, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const problems = [];
// a command-line report, so plain stdout rather than console (which the lint rules keep for real problems)
const report = (line) => process.stdout.write(line + '\n');

/** Runs axe-core (installed next to playwright-core) on the page as it is now; every violation is a problem. */
async function checkAccessibility(page, theme, name) {
  const axePath = join(PLAYWRIGHT_DIR, 'node_modules', 'axe-core', 'axe.min.js');
  await page.addScriptTag({ content: readFileSync(axePath, 'utf8') });
  const violations = await page.evaluate(async () => {
    // WCAG 2.1 A and AA: what the law and most audits ask for
    const result = await window.axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
      count: violation.nodes.length,
      // for contrast: each failing colour pair once, "text on background ratio (needed)"
      colours: [
        ...new Set(
          violation.nodes
            .map((node) => node.any[0]?.data)
            .filter((data) => data?.fgColor)
            .map(
              (data) =>
                `${data.fgColor} on ${data.bgColor} ${data.contrastRatio}:1 (needs ${data.expectedContrastRatio})`
            )
        ),
      ],
    }));
  });
  report(`[${theme}] a11y ${name}: ${violations.length} kinds of violation`);
  for (const violation of violations) {
    const line = `[${theme}] a11y ${name}: ${violation.impact} ${violation.id} (${violation.count}×) ${violation.help} → ${violation.targets.join(', ')}`;
    report(line);
    problems.push(line);
    for (const colour of violation.colours) report(`    ${colour}`);
  }
}

/** "Verbs" matches exactly; "/se lever/" is a regular expression. */
const nameMatcher = (name) => (/^\/.*\/$/.test(name) ? new RegExp(name.slice(1, -1)) : name);

for (const theme of options.themes.split(',')) {
  const context = await browser.newContext({
    viewport: { width: Number(options.width), height: 844 },
    colorScheme: theme,
    locale: 'en-US',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(STEP_TIMEOUT);
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`[${theme}] console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`[${theme}] page error: ${error.message}`));
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    let body = null;
    try {
      body = request.postDataJSON();
    } catch {
      // GET requests have no body
    }
    await route.fulfill({ json: answerFor(request.url(), body, request.headers()) });
  });

  // the ?doc= link stores the test document, as a student link does; the app then loads it
  await page.goto(`${BASE_URL}/?doc=${DOCUMENT_ID}`);
  await page.getByText('synced').first().waitFor();

  for (const step of steps) {
    const [command, ...words] = step.split(' ');
    const rest = words.join(' ');
    try {
      if (command === 'nav') await page.goto(BASE_URL + rest);
      else if (command === 'click' || command === 'hover') {
        const [role, ...nameWords] = words;
        const element = page
          .getByRole(role, { name: nameMatcher(nameWords.join(' ')), exact: true })
          .first();
        if (command === 'click') await element.click();
        else {
          await element.hover();
          // the tooltip appears after a short rest (HOVER_DELAY in TooltipLayer)
          await page.waitForTimeout(600);
        }
      } else if (command === 'press') await page.keyboard.press(rest);
      else if (command === 'eval')
        report(`[${theme}] eval: ${JSON.stringify(await page.evaluate(rest))}`);
      else if (command === 'click-text')
        await page.getByText(rest, { exact: true }).first().click();
      else if (command === 'fill') {
        // fill table.conj input @0 je n’aime pas: the selector may contain spaces, @ marks the index
        const marker = words.findIndex((word) => /^@\d+$/.test(word));
        if (marker < 1) throw new Error('fill needs: fill <selector> @<index> <text>');
        await page
          .locator(words.slice(0, marker).join(' '))
          .nth(Number(words[marker].slice(1)))
          .fill(words.slice(marker + 1).join(' '));
      } else if (command === 'wait-text') await page.getByText(rest).first().waitFor();
      else if (command === 'shot') {
        const path = join(options.out, `${theme}-${rest}.png`);
        await page.screenshot({ path, fullPage: true });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        if (overflow > 0)
          problems.push(`[${theme}] ${rest}: page scrolls sideways by ${overflow}px`);
        report(`[${theme}] screenshot ${path}`);
      } else if (command === 'classes') {
        const classes = await page
          .locator(rest)
          .evaluateAll((elements) => elements.map((element) => element.className));
        report(`[${theme}] ${rest}: ${classes.join(' | ')}`);
      } else if (command === 'a11y') await checkAccessibility(page, theme, rest);
      else throw new Error(`unknown command "${command}"`);
    } catch (error) {
      problems.push(`[${theme}] step "${step}" failed: ${error.message.split('\n')[0]}`);
      break;
    }
  }
  await context.close();
}
await browser.close();
report(
  problems.length
    ? problems.join('\n')
    : 'OK: no console errors, no sideways scroll, every step ran'
);
process.exitCode = problems.length ? 1 : 0;
