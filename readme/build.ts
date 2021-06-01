import fs from 'fs';

const load = (name: string) => fs.readFileSync(name, 'utf-8');

const demo = (name: string) => name;

const res = `
${load('header.md')}

## Menu
${'GENERATE MENU HERE PLEASE'}

${load('deno.md')}

## Getting started

${demo('hello-world')}
`;

console.log(res);
