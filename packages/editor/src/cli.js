#!/usr/bin/env node


import { exec } from 'child_process'


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonLocation = __dirname.split('src')[0]

exec(`npm run preview --prefix ${packageJsonLocation} `, (err, stdout, stderr) => {
    if (err) {
          console.log(`err: ${err}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});
