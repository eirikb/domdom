// Only Deno compatible

if(Deno) export * from './src/index.ts';
else throw "This file only works with Deno.";
