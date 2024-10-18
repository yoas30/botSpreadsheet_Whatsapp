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
        //  console.log("Coba 1:"+ pesan.key.remoteJid);
        // console.log("Coba 2:"+ pesan.message.extendedTextMessage.text);

        if (pesan.message && pesan.message.conversation) {
            const pesanTeks = pesan.message.conversation; // membuat variabel baru
            
            if (pesan.key.remoteJid.includes('@s.whatsapp.net') && pesanTeks.includes('cek ')){ //tidak masuk grup WA
                    await sock.sendMessage(pesan.key.remoteJid, {
                        text: 'Silahkan Tunggu *'+pesan.pushName+'* 🙂\nSedang Mencari Data...'
                            })
                    //cek API dan kirim data

                    axioss.get("https://script.google.com/macros/s/AKfycbxNcTaFS3oJCNRseaPsFnai70K8LYBZm47aIT6Lwt9qgr14paPhc62R8rxJzj-SHGhg/exec?perintah="+pesanTeks.replace('cek ','')+"&perintah_nometer="+pesanTeks.replace('cek ',''))
                            .then(async(response) =>{
                                let str;
                                //console.log(response.data);
                                const {success,data,message} = response.data;
                                if (success == true){
                                    str = `========================================
                                    \n*BERIKUT DATA PELANGGAN TERDAFTAR :*
                                    \nNO NIK : *${data.NIK_DIL}*\nID PEL/NO METER : *${data.IDPEL}*\nID PEL/NO METER : *${data.NO_METER}*\nTARIF : *${data.TARIF}*\nDAYA : *${data.DAYA}*\nNAMA PELANGGAN : *${data.NAMA_PELANGGAN}*\nJENIS LAYANAN : *${data.JENIS_LAYANAN}*\nALAMAT : *${data.ALAMAT}*\nKELURAHAN : *${data.KELURAHAN}*
                                    \nLOKASI : *_https://www.google.com/maps/place/${data.TIKOR_X},${data.TIKOR_Y}_*
                                    \nFOTO KWH METER : *${data.FOTO_KWH_METER}*
                                    \nFOTO RUMAH : *${data.FOTO_RUMAH}*
                                    \n\nTERIMA KASIH, APABILA TERKENDALA\nHUBUNGI PADA LINK : _*https://www.pdppbn.online*_
                                    \nTERKENDALA SISTEM\nDAPAT HUBUNGI IT : *085161012107*
                                    \n\nSELAMAT BEKERJA KEMBALI 😊
                                    \n========================================`
                                    await sock.sendMessage(pesan.key.remoteJid,{
                                        text: str
                                    })
                                } else if (success == false){
                                    await sock.sendMessage(pesan.key.remoteJid,{
                                        text: '⚠️ MAAF, DATA "*'+pesanTeks.replace('cek ','')+'*" TIDAK DITEMUKAN⚠️\n\nUNTUK BANTUAN LEBIH LANJUT, SILAKAN HUBUNGI PIC KAMI DI NOMOR *081200121301*\n\nAPABILA TERKENDALA HUBUNGI IT KAMI *085161012107*.\nKAMI SIAP MEMBANTU ANDA !'
                                    })
                                }
                            });
            } else if (pesan.key.remoteJid.includes('@s.whatsapp.net') && (pesanTeks.includes('info')|| pesanTeks.includes('Info')))
                {
                        await sock.sendMessage(pesan.key.remoteJid,{
                            text: `🌟 Selamat Datang di Layanan Pelanggan Kami! 🌟\nKami siap membantu Anda dengan informasi yang Anda butuhkan.
                            \nJika Anda ingin mengecek data pelanggan Anda,\nsilahkan ketik *"cek (spasi) ID_PELANGGAN/NO_METER"*.
                            \nContoh : *cek 2938475923*
                            \nKami akan memberikan informasi mengenai ID Pelanggan atau Nomor Meter Anda.
                            \nApabila terkendala hubungi IT kami *085161012107*.`
                        })
                }
          }
       }

        
    });
}

startSock()
