// npm i --no-save shelljs puppeteer http-server gifencoder png-js
import sh from 'shelljs';
import { buildMenu, current, readCode, run } from './halp';

(async () => {
  const bottom = `
${sh.cat('deno.md')}

## Getting started

Install:
${'```bash'}
npm i @eirikb/domdom
${'```'}

### Hello, world!
run.sh:
${'```bash'}
npx parcel index.html
${'```'}
${readCode('hello-world/index.html')}
${readCode('hello-world/app.tsx')}

Output:
${await run('hello-world')}

### TSX tags are pure elements

${readCode('pure-elements/app.tsx')}
Output:
${await run('pure-elements')}

### Domponents

${readCode('domponents/app.tsx')}
Output:
${await run('domponents')}

### Domponents with options

${readCode('domponents-options/app.tsx')}
Output:
${await run('domponents-options')}

### Events

${readCode('events/app.tsx')}
Output:
${await run('events', async ({ snapshot, page }) => {
  await snapshot();
  page.click('button');
  await snapshot();
})}

`;
  const res = `
${sh.cat('header.md')}

## Menu
${buildMenu(bottom)}

${bottom}
  `;

  sh.echo(res).to(`${current}/../readme-out.md`);
})();
