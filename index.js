const { DisconnectReason, useSingleFileAuthState, useMultiFileAuthState} = require('@whiskeysockets/baileys');
const makeWaSocket = require ('@whiskeysockets/baileys').default;
const axioss = require('axios');


async function startSock () {
    const {state, saveCreds} = await useMultiFileAuthState('auth_info');
    const sock = makeWaSocket({
        
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('connection.update', function (update){
        let _a, _b;
        let connection = update.connection, lastDisconnect = update.lastDisconnect;
        if(connection == 'close'){
            if (((_b = (_a = lastDisconnect.error) === null
                || _a === void 0 ? void 0 : _a.output) === null
                || _b === void 0 ? void 0 : _b.statusCode) !== DisconnectReason.loggedOut){
                    startSock()
                }
        } else {
            console.log('connection closed');
        }
        console.log('connection update', update);
    });

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async m => {
        const pesan = m.messages[0];

        if (!pesan.key.fromMe && m.type === 'notify'){
        // console.log(JSON.stringify(pesan));
       console.log("Coba 1:"+ pesan.key.remoteJid);
       console.log("Coba 2:"+ pesan.message.extendedTextMessage.text);

        await sock.sendMessage(pesan.key.remoteJid, {
            text: 'Sedang Mencari Data...\nSilahkan Tunggu '+pesan.pushName+' 🙂'
        })

            if (pesan.key.remoteJid.includes('@s.whatsapp.net')){ //tidak masuk grup WA
                if (pesan.message.extendedTextMessage.text){
                    //cek API dan kirim data
                    axioss.get("https://script.google.com/macros/s/AKfycbxVMlkkuJC-_LerMsPaWR37ClPbxBZC1kafmkaRT7GEzzzjfN8cQg6DpSVRABl4JyYK/exec?perintah="+pesan.message.extendedTextMessage.text)
                            .then(async(response) =>{
                                let str;
                                console.log(response.data);
                                const {success,data,message} = response.data;
                                if (success == true){
                                    str = `Berikut Data Pelanggan Terdaftar:\nID PELANGGAN : *${data.IDPEL}*
                                    \nNO METER : *${data.NO_METER}*\nTARIF : *${data.TARIF}*\nDAYA : *${data.DAYA}*
                                    \nNAMA PELANGGAN : *${data.NAMA_PELANGGAN}*\nJENIS LAYANAN : *${data.JENIS_LAYANAN}*
                                    \nALAMAT : *${data.ALAMAT}*\nKELURAHAN : *${data.KELURAHAN}*
                                    \nLOKASI : *_https://www.google.com/maps/place/${data.TIKOR_X},${data.TIKOR_Y}_*
                                    \n\nTERIMA KASIH, SELAMAT BEKERJA KEMBALI 😊`
                                    await sock.sendMessage(pesan.key.remoteJid,{
                                        text: str
                                    })
                                } else if (success == false){
                                    str = 'MOHON MAAF DATA PELANGGAN *'+pesan.message.extendedTextMessage.text+'* TIDAK DITEMUKAN, HARAP HUBUNGI PIC DI NOMOR *081200121301* \nTERIMA KASIH 😊'
                                    await sock.sendMessage(pesan.key.remoteJid,{
                                        text: str
                                    })
                                }
                            });
                }else{
                    await sock.sendMessage(pesan.key.remoteJid, {
                        text: 'Selamat datang di Layanan PLN.\n\nSilahkan ketik "cek status" untuk cek ID_Pelanggan anda.'
                        
                    })
                }
            }
        }

        
    });
}

startSock();