// npm i --no-save shelljs puppeteer http-server gifencoder png-js
import sh from 'shelljs';
import { buildMenu, current, readCode, run, tmp } from './halp';

(async () => {
  const child = sh.exec(`../node_modules/.bin/http-server ${tmp}/dist`, {
    async: true,
  });

  const bottom = `
${sh.cat('deno.md')}

## Getting started

Install:
${'```bash'}
npm i @eirikb/domdom
${'```'}

## Basics

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

## State

### Listen for changes

${readCode('don/app.tsx')}
Output:

${await run('don')}

### Listen for changes in arrays / objects

${readCode('don-wildcard/app.tsx')}
Output:

${await run('don-wildcard')}

### Listen for changes in sub-listeners

${readCode('don-children/app.tsx')}
Output:

${await run('don-children', async ({ page, snapshot }) => {
  await snapshot();
  await page.click('button');
  await snapshot();
})}

### Update state

${readCode('data-set/app.tsx')}
Output:

${await run('data-set', async ({ snapshot, page }) => {
  await snapshot();
  page.click('button');
  await snapshot();
})}

### Automatic binding

${readCode('dd-model/app.tsx')}
Output:

${await run('dd-model', async ({ snapshot, page }) => {
  await snapshot();
  await page.click('input', { clickCount: 3 });
  for (const c of 'there'.split('')) {
    await page.type('input', c);
    await snapshot();
  }
})}

### Data in attributes

${readCode('data-attibutes/app.tsx')}
Output:

${await run('data-attributes', async ({ snapshot, page }) => {
  await snapshot();
  await page.click('button');
  await snapshot();
  await page.click('button');
  await snapshot();
  await page.click('button');
  await snapshot();
})}

## Pathifier

${readCode('pathifier/app.tsx')}
Output:

${await run('pathifier')}

`;

  sh.cd(current);
  const res = `
${sh.cat('header.md')}

## Menu
${buildMenu(bottom)}

${bottom}
  `;

  console.log('DONE! Stop web server');
  child.kill();

  console.log('Done! Writing to file...');
  sh.ShellString(res).to(`${current}/../readme.md`);
  console.log('Done!');
})()
  .catch(e => {
    console.log(e);
  })
  .then(() => {
    console.log('really done...');
    console.log('what now?');
  });
