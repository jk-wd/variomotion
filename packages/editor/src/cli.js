#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const argv = yargs(hideBin(process.argv)).argv

// Blocks the event loop
const config = JSON.parse(fs.readFileSync(path.resolve(argv.config ?? './vario.config.json')));
fs.writeFileSync(path.resolve(__dirname, './localconfig.json'), JSON.stringify(config))

console.log(config.socketPort ?? 8787)

const command2 = spawn(`node`, [`${__dirname}/scripts/socket.js`]);
const command = spawn(`node`,  [`${__dirname}/scripts/editor.js`]);
const command3 = spawn(`node`, [`${__dirname}/scripts/open.js`, `--url=${argv.url}`,  `--socketPort=${config.socketPort ?? 8787}`]);


command.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});

command.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

command.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});

command2.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});

command2.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

command2.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});

command3.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});

command3.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

command3.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});