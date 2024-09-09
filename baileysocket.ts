import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

var sockg : ReturnType<typeof makeWASocket> | null= null

export async function connectToWhatsApp () {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: true,
        auth: state 
    })

    
    sock.ev.on ('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
            sockg = sock
            
        }
    })
    sock.ev.on('messages.upsert', async(m) => {
        console.log(m.messages)
        // await sock.sendMessage(m.messages[0].key.remoteJid || "", {text :"Hello World"})
    })
}
// run in main file

export function getSockg() {
    return sockg
}