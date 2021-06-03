import sh from 'shelljs';
import puppeteer from 'puppeteer';

export const current = sh.pwd();
const tmp = `${sh.tempdir()}/dd-demo-${Math.random() * 100000000000000000}`;

export const readCode = (
  name: string,
  header: string | undefined = undefined,
  type: string | undefined = undefined
): string => {
  sh.cd(current);
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

export const run = async (name: string): Promise<string> => {
  sh.cd(current);
  console.log('GO GO DEMO', name);
  if (!sh.test('-e', tmp)) {
    console.log(`tmp folder ${tmp} does not exist, creating...`);
    sh.rm('-rf', tmp);
    sh.cp('-r', `../examples/${name}`, tmp);
    sh.cp('-r', `../examples/${name}`, tmp);
    sh.cd(tmp);
    console.log('npm i');
    sh.exec(`npm i parcel@next http-server ${current}/..`);
  } else {
    console.log(`tmp folder ${tmp} exists, preparing...`);
    sh.cp('-r', `../examples/${name}/*`, `${tmp}/`);
    sh.cd(tmp);
    sh.rm('-rf', `dist`);
  }
  console.log(tmp);
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

export const buildMenu = (input: string): string =>
  input
    .split('\n')
    .filter(p => p.startsWith('#'))
    .join('\n');
