import { WebSocketServer } from 'ws';
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../localconfig.json')));

const wss = new WebSocketServer({
  port: 8787,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
});


let editors = {}
let sites = {}


function saveFile(animationData, autosave = false) {  
  console.log(animationData.metaData, config)
  if(!animationData.metaData.projectName || !config.animationFiles || !config.animationFiles[animationData.metaData.projectName]) {
    return
  }
  const fileLocation = config.animationFiles[animationData.metaData.projectName]
  const autoSaveFileLocation = fileLocation.split('.json')[0] + '-autosave.json'
  if(!autosave) {
    fs.rmSync(`${path.resolve(autoSaveFileLocation)}`, { force: true })
  }
  if(autosave) {
    console.log("File autosaved")
  } else {
    console.log("File saved")
  }
  
  fs.writeFileSync(`${path.resolve(autosave ? autoSaveFileLocation: fileLocation)}`, JSON.stringify(animationData))
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    
    const msg = JSON.parse(String.fromCharCode(...data));
    
    if(msg.source === 'site' && msg.socketChannelId) {
      if(msg.type === "send-animation-data-to-editor") {
        saveFile(msg.data.animationData, true)
      }
      if(msg.type === "save-file") {
        saveFile(msg.data.animationData)
      }
      sites[msg.socketChannelId] = ws
      
      if(editors[msg.socketChannelId]) {
        editors[msg.socketChannelId].send(JSON.stringify(msg))
      }
      
    }
    if(msg.source === 'editor' && msg.socketChannelId) {
      if(msg.type === "send-animation-data-to-site") {
        saveFile(msg.data, true)
      }
      if(msg.type === "save-file") {
        saveFile(msg.data)
      }
      editors[msg.socketChannelId] = ws
      if(sites[msg.socketChannelId]) {
        sites[msg.socketChannelId].send(JSON.stringify(msg))
      }
      
    }

  });

});
