import fs from 'fs';
import sh from 'shelljs';
import puppeteer from 'puppeteer';
import GIFEncoder from 'gifencoder';
import PNG from 'png-js';

const width = 320;
const height = 100;

export const current = sh.pwd();
export const tmp = `${sh.tempdir()}/dd-demo-${Math.random() *
  100000000000000000}`;

function decode(png) {
  return new Promise(r => {
    png.decode(pixels => r(pixels));
  });
}

async function gifAddFrame(page, encoder) {
  const pngBuffer = await page.screenshot({
    clip: { width, height, x: 0, y: 0 },
  });
  const png = new PNG(pngBuffer);
  await decode(png).then(pixels => encoder.addFrame(pixels));
}

export const readCode = (
  name: string,
  header: string | undefined = undefined,
  type: string | undefined = undefined
): string => {
  sh.cd(current);
  if (header === undefined) {
    header = name.split('/').slice(-1)[0];
    header = `[${header}](./examples/${name})`;
  }
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

interface HandlerOptions {
  snapshot(frames: number): Promise<void>;

  page: puppeteer.Page;
}

type Handler = (options: HandlerOptions) => Promise<void>;

export const run = async (
  name: string,
  handler: Handler | undefined = undefined
): Promise<string> => {
  sh.cd(current);
  console.log('GO GO DEMO', name);
  if (!sh.test('-e', tmp)) {
    console.log(`tmp folder ${tmp} does not exist, creating...`);
    sh.rm('-rf', tmp);
    sh.cp('-r', `../examples/${name}`, tmp);
    sh.cp('-r', `../examples/${name}`, tmp);
    sh.cd(tmp);
    console.log('npm i');
    sh.exec(`npm i parcel@next ${current}/..`);
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
  console.log('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const errors: Error[] = [];
  page.on('pageerror', err => errors.push(err));
  page.on('error', err => errors.push(err));

  await page.goto('http://localhost:8080');

  let img = `${name}.png`;
  if (handler !== undefined) {
    img = `${name}.gif`;
    const encoder = new GIFEncoder(width, height);
    encoder
      .createWriteStream()
      .pipe(fs.createWriteStream(`${current}/img/${img}`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(150);

    // await installMouseHelper(page);
    await handler({
      async snapshot(frames = 1) {
        for (let i = 0; i < frames; i++) {
          await gifAddFrame(page, encoder);
        }
      },
      page,
    });
    await encoder.finish();
  } else {
    await page.screenshot({
      path: `${current}/img/${img}`,
      clip: { width, height, x: 0, y: 0 },
    });
  }

  await browser.close();
  console.log(errors);

  if (errors.length > 0) throw new Error(errors.join('\n'));

  return `![${name}](readme/img/${img})`;
};

export const buildMenu = (input: string): string =>
  input
    .split('\n')
    .filter(p => p.startsWith('#'))
    .map(p => {
      const parts = p.split('#');
      const size = parts.length - 2;
      const name = parts[parts.length - 1].trim();
      return `${''.padStart(size * 2)}- [${name}](#${name
        .replace(/[\/]/g, '')
        .replace(/[ ]/g, '-')
        .toLocaleLowerCase()})`;
    })
    .join('\n');
