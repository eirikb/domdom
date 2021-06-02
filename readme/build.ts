// npm i --no-save shelljs puppeteer http-server
import sh from 'shelljs';
import puppeteer from 'puppeteer';

const readCode = (
  name: string,
  header: string | undefined = undefined,
  type: string | undefined = undefined
): string => {
  if (header === undefined) header = name.split('/').slice(-1)[0];
  if (type === undefined) type = name.split('.').slice(-1)[0];
  const file = sh.cat(`../examples/${name}`).trim();
  const parts = file.split(/\/\/.*important part/i);
  let code = file;
  if (parts.length > 1) {
    code = parts
      .filter((_, i) => i % 2 === 1)
      .join('\n')
      .trim();
  }
  return [header + ':', '```' + type, code, '```'].join('\n');
};

const current = sh.pwd();

const run = async (name: string): Promise<string> => {
  console.log('GO GO DEMO', name);
  const tmp = `${sh.tempdir()}/dd-demo-${name}`;
  console.log(tmp);
  sh.rm('-rf', tmp);
  sh.cd(current);
  sh.cp('-r', `../examples/${name}`, tmp);
  sh.cd(tmp);
  console.log('npm i');
  sh.exec(`npm i parcel@next http-server ${current}/..`);
  console.log('build');
  sh.exec('./node_modules/.bin/parcel build index.html');
  sh.cd('dist');
  const child = sh.exec('../node_modules/.bin/http-server', { async: true });
  console.log('http');
  console.log('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const errors: Error[] = [];
  page.on('pageerror', err => errors.push(err));
  page.on('error', err => errors.push(err));
  await page.goto('http://localhost:8080');
  const img = `${name}.png`;
  await page.screenshot({ path: `${current}/img/${img}` });
  await browser.close();
  child.kill();
  console.log(errors);

  if (errors.length > 0) throw new Error(errors.join('\n'));

  return `![${name}](readme/img/${img})`;
};

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

`;

  const menu = bottom.split('\n').filter(p => p.startsWith('#'));

  const res = `
${sh.cat('header.md')}

## Menu
${menu.join('\n')}

${bottom}
  `;

  sh.echo(res).to(`${current}/../readme-out.md`);
})();
