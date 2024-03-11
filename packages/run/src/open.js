

import yargs from 'yargs/yargs'

import { hideBin } from 'yargs/helpers'
import open from 'open';

const argv = yargs(hideBin(process.argv)).argv
setTimeout(() => {
    open(`http://localhost:5173/?siteurl=${encodeURIComponent(argv.url)}&socketport=${argv.socketPort ?? 7766}`);
}, 1000)
