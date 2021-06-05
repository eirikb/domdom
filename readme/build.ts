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

All elements created with tsx are elements which can be instantly referenced.

${readCode('pure-elements/app.tsx')}
Output:

${await run('pure-elements')}

### Domponents

By creating a function you create a Domponent (component).

${readCode('domponents/app.tsx')}
Output:

${await run('domponents')}

### Domponents with options

It's possible to pass in children, and get a callback when a domponent is mounted (in DOM).  
All attributes are passed in first argument.

${readCode('domponents-options/app.tsx')}
Output:

${await run('domponents-options')}

### Events

All attributes starting with 'on' are added to addEventListener on the element.

${readCode('events/app.tsx')}
Output:

${await run('events', async ({ snapshot, page }) => {
  await snapshot(1);
  page.click('button');
  await snapshot(1);
})}

## State

State handling in domdom is simple: No local state, only one huge global state.  
Setting data directly on the ${'`data`'} object can update DOM directly in combination with ${'`don`'}

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
  await snapshot(1);
  await page.click('button');
  await snapshot(1);
})}

### Update state

${readCode('data-set/app.tsx')}
Output:

${await run('data-set', async ({ snapshot, page }) => {
  await snapshot(1);
  page.click('button');
  await snapshot(1);
})}

### Data in attributes

${readCode('data-attributes/app.tsx')}
Output:

${await run('data-attributes', async ({ snapshot, page }) => {
  await snapshot(1);
  await page.click('button');
  await snapshot(1);
  await page.click('button');
  await snapshot(1);
  await page.click('button');
  await snapshot(1);
})}

### Automatic binding

${readCode('dd-model/app.tsx')}
Output:

${await run('dd-model', async ({ snapshot, page }) => {
  await snapshot(1);
  await page.click('input', { clickCount: 3 });
  for (const c of 'there'.split('')) {
    await page.type('input', c);
    await snapshot(1);
  }
})}

## Pathifier

Aggregate data.
Supports:
  * ${'`map`'}
  * ${'`sort`'}
  * ${'`slice`'}
  * ${'`filter`'}

And in addition accompanying "on" version, making it possible to listen for an external path:
  * ${'`mapOn`'}
  * ${'`sortOn`'}
  * ${'`sliceOn`'}
  * ${'`filterOn`'}

${readCode('pathifier/app.tsx')}
Output:

${await run('pathifier')}

## Recipies

How to handle common tasks with domdom

### Routing

${readCode('routing/app.tsx')}
Output:

${await run('routing', async ({ snapshot, page }) => {
  await snapshot(3);
  await page.click('button');
  await snapshot(3);
})}

### Structure

This is how I would suggest putting domdom in its own file for importing.

${readCode('structure/app.tsx')}
${readCode('structure/domdom.ts')}
Output:

${await run('structure')}

### Animation (garbage collection)

At writing moment domdom doesn't have any unmount callback.
I'm not a big fan of destructors, unmounted, dispose or similar.
This might seem silly, and it might not be obvious how to use say setInterval, without this preventing the element from ever being cleaned up by garbage collector.

This is how I would suggest putting domdom in its own file for importing.

${readCode('ticks/app.tsx')}
`;

  sh.cd(current);
  const res = `
${sh.cat('header.md')}

## Menu
${buildMenu(bottom)}

${bottom}
  `;

  child.kill();
  sh.ShellString(res).to(`${current}/../readme.md`);
  console.log('Done!');

  // No idea why I have to kill the script. Something "dangling" - no idea what. Works locally, but not in GitHub Actions
  process.exit();
})();
