

import yargs from 'yargs/yargs'
import http from 'http'

import { hideBin } from 'yargs/helpers'
import open from 'open';

let startPort = 5173
let port = startPort
const maxAttempts = 15
let attempts = 0
let timeout;
const argv = yargs(hideBin(process.argv)).argv


async function openLoop() {
    if(attempts >= maxAttempts) {
         clearTimeout(timeout)
        return
    }
    try {
        do {
         
            const response = await fetch(`http://localhost:${port}/heartbeat`)
            if(response.status === 200) {
                   console.log(port, response.status)
                open(`http://localhost:5173/?siteurl=${encodeURIComponent(argv.url)}&socketport=${argv.socketPort ?? 7766}`);
            }
            
            clearTimeout(timeout)
            
            port += 1
        } while (port < startPort + 10)
        port = startPort
    } catch (e) {
        timeout = setTimeout(openLoop, 300)
        attempts += 1
    }
   
}

openLoop();

