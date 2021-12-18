const { Discord, Client, MessageEmbed } = require('discord.js');
const client = global.client = new Client({fetchAllMembers: true});
const fs = require('fs');


let Options = {
  "sunuculog": "guild-log", //yedek log 
  "token": "", //bot token
  "seskanalismi": "floxy", //ses kanal ismi
  "whitelist": ["","",]
}

let kurucu = {
  "botOwner": "", //owner id
  "guildID": "", //sunucu id
  "botPrefix": "f?" //prefix
}

client.on("ready", async () => {
  client.user.setPresence({activity: {name: ' ❤️ Floxy'}, status: 'idle'});
  let botVoiceChannel = client.channels.cache.find(channel => channel.name === Options.seskanalismi);
  if (botVoiceChannel) botVoiceChannel.join().catch(err => console.error("Bot ses kanalına bağlanamadı!"));
});


client.on("message", async message => {
  if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(kurucu.botPrefix)) return;
  if (message.author.id !== kurucu.botOwner && message.author.id !== message.guild.owner.id) return;
  let args = message.content.split(' ').slice(1);
  let command = message.content.split(' ')[0].slice(kurucu.botPrefix.length);
  
  if (command === "eval" && message.author.id === kurucu.botOwner) {
    if (!args[0]) return message.channel.send(`Kod belirtilmedi`);
      let code = args.join(' ');
      function clean(text) {
      if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
      text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
      return text;
    };
    try { 
      var evaled = clean(await eval(code));
      if(evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
      message.channel.send(`${evaled.replace(client.token, "Yasaklı komut")}`, {code: "js", split: true});
    } catch(err) { message.channel.send(err, {code: "js", split: true}) };
  };
});

// Cezalandırma fonksiyonu
function cezalandir(kisiID, tur) {
  let uye = client.guilds.cache.get(kurucu.guildID).members.cache.get(kisiID);
  if (!uye) return;
  if (tur == "ban") return uye.ban({ reason: "Floxy Guild Guard" }).catch();
};
// Güvenli kişi fonksiyonu
function guvenli(kisiID) {
  let uye = client.guilds.cache.get(kurucu.guildID).members.cache.get(kisiID);
  let guvenliler = Options.whitelist || [];
  if (!uye || uye.id === client.user.id || uye.id === Options.botOwner || uye.id === uye.guild.owner.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
};




let urlguard = {
  "Vanity_URL": "", //urlni gir
}

client.on("channelDelete", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());
  if(!entry || !entry.executor || guvenli(entry.executor.id) ) return;

  const embed = (
  new MessageEmbed()
  .setColor("#b50101")
  .setTitle('Sunucuda İzinsiz Bir Kanal Silindi!')
  .setDescription(`${entry.executor} Adlı yetkili tarafından bir kanal silindi!
  \nSilinen kanalın id'si Channel ID: [**${channel.id}**] 
  \nYetkili banlandı ve rollerdeki tüm yetkiler kapatıldı
  \nSilinen kanal geri açıldı.`)
  .setFooter(`Snow Sikme Sistemi`)
  .setTimestamp())

  await closeAllPerms()
  await channel.guild.members.ban(entry.executor.id, {
    reason: "Kanal silmek"
}).catch(e => client.channels.cache.get(channelLogs).send("@here <@" + entry.executor.id + "> Kanal sildi fakat yetkim yetmediği için kullanıcıyı banlayamadım"));
  
  await channel.clone({ reason: "Kanal Korum Sistemi!" }).then(async kanal => {
  if(channel.parentID != null) await kanal.setParent(channel.parentID);
  await kanal.setPosition(channel.position);
  if(channel.type == "category") await channel.guild.channels.cache.filter(k => k.parentID == channel.id).forEach(x => x.setParent(kanal.id));});

  client.users.cache.get(config.brontes).send(embed);
  let xd = client.channels.cache.get(channelLogs);
  if (xd) {
    xd.send(embed)
  } else {
    return;
  };
});

////////// KANAL SİLME SON //////////

////////// KANAL GÜNCELLEME //////////
client.on("channelUpdate", async (oldChannel, newChannel) => {
  let entry = await newChannel.guild.fetchAuditLogs({type: 'CHANNEL_UPDATE'}).then(audit => audit.entries.first());
  if(!entry || !entry.executor || !newChannel.guild.channels.cache.has(newChannel.id) || guvenli(entry.executor.id)) return;

    const embed = (
    new MessageEmbed()
    .setColor("#b50101")
    .setTitle('Sunucuda İzinsiz Bir Kanal Güncellendi!')
    .setDescription(`${entry.executor} Adlı yetkili tarafından kanal güncellenildi
      \n**Güncellenen kanalın bilgisi**
      \n**${oldChannel.name}** - **Kanal İdsi:** \`\`\`${oldChannel.id}}\`\`\`
      \nKullanıcı sunucudan yasaklandı! 
      \nRollerdeki tüm yetkiler kapatıldı.
      \nKanal eski ayarlarına geri çevrildi.`)
    .setFooter(`Snow Sikme Sistemi`)
    .setTimestamp()
   )

  if(newChannel.type !== "category" && newChannel.parentID !== oldChannel.parentID) newChannel.setParent(oldChannel.parentID);
  if(newChannel.type === "category") {
    newChannel.edit({ name: oldChannel.name,});
  } else if (newChannel.type === "text") {newChannel.edit({ name: oldChannel.name, topic: oldChannel.topic, nsfw: oldChannel.nsfw, rateLimitPerUser: oldChannel.rateLimitPerUser });
  } else if (newChannel.type === "voice") {newChannel.edit({ name: oldChannel.name, bitrate: oldChannel.bitrate, userLimit: oldChannel.userLimit, });};
  oldChannel.permissionOverwrites.forEach(perm => {let thisPermOverwrites = {}; perm.allow.toArray().forEach(p => { thisPermOverwrites[p] = true;}); perm.deny.toArray().forEach(p => {thisPermOverwrites[p] = false; });
  newChannel.createOverwrite(perm.id, thisPermOverwrites);});

  await closeAllPerms()
  await oldChannel.guild.members.ban(entry.executor.id, {
    reason: "Kanal oluşturmak"
}).catch(e => client.channels.cache.get(channelLogs).send("@here <@" + entry.executor.id + "> Kanal oluşturdu fakat yetkim yetmediği için kullanıcıyı banlayamadım"));
client.users.cache.get(config.brontes).send(embed);
let xd = client.channels.cache.get(channelLogs);
    if (xd) {
      xd.send(embed)
    } else {
      return;
    };  
});
////////// KANAL GÜNCELLEME SON //////////

////////// KANAL OLUŞTURMA ////////// 
client.on("channelCreate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id)) return;

      const embed = new MessageEmbed()
      .setThumbnail(client.user.avatarURL({dynamic:true}))
      .setColor("#b50101")
      .setTitle('İzinsiz Kanal oluşturuldu!')
      .setDescription(`
        \n**Kanal açmaya çalışan kullanıcı Bilgisi**
        \n${entry.executor.tag} - \`\`\`${entry.executor.id}\`\`\` 
        \n**Açılan kanalın bilgisi**
        \n****${channel}*** - **Kanal İdsi:** \`\`\`${channel.id}}\`\`\`
        \nKullanıcı sunucudan yasaklandı! 
        \nRollerdeki tüm yetkiler kapatıldı.
        \nAçılan kanal silindi.`)
    .setFooter(`Snow Sikme Sistemi`)
    .setTimestamp();

    await closeAllPerms()
    await channel.delete()
    await channel.guild.members.ban(entry.executor.id, {
      reason: "Kanal oluşturmak"
  }).catch(e => client.channels.cache.get(channelLogs).send("@here <@" + entry.executor.id + "> Kanal oluşturdu fakat yetkim yetmediği için kullanıcıyı banlayamadım"));
  client.users.cache.get(config.brontes).send(embed);
  let xd = client.channels.cache.get(channelLogs);
  if (xd) {
    xd.send(embed)
  } else {
    return;
  };});
////////// KANAL OLUŞTURMA SON //////////

////////// WEBHOOK OLUŞTURMA //////////
client.on("webhookUpdate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'WEBHOOK_CREATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id)) return;

    const embed = new MessageEmbed().setColor("2f3136")
    .setTitle('Bir Kullanıcı Webhook Oluşturdu!')
    .setDescription(`Oluşturan kullanıcı: ${entry.executor} - (\`${entry.executor.id}\`) oluşturan kişiyi yasakladım!
    \nYetkileri kapattım, Yetkiliyi banladım ve Oluşturulan webhook'u sildim!
    \nOluşturulan Webhook: **${channel}**`);

  await closeAllPerms()
  await channel.guild.members.ban(entry.executor.id, {
    reason: "Kanal oluşturmak"
}).catch(e => client.channels.cache.get(channelLogs).send("@here <@" + entry.executor.id + "> Kanal oluşturdu fakat yetkim yetmediği için kullanıcıyı banlayamadım"));
   
 client.users.cache.get(config.brontes).send(embed);
  let log = client.channels.cache.find(channel => channel.id === channelLogs);
  let xd = client.channels.cache.get(channelLogs);
  if (xd) {
    xd.send(embed)
  } else {
    return;
  };});

////////// WEBHOOK OLUŞTURMA SON //////////

function guvenli(kisiID) {
  let uye = client.guilds.cache.get(Options.guildID).members.cache.get(userID);
  let dev = config.developers; 
  let owner = config.owner;
  let botçuk = config.bots;
  if (!uye || uye.id === client.user.id || botçuk.some(g => g === uye.id  || dev.some(g => g === uye.id || uye.id === uye.guild.owner.id 
           || owner.some(g => g === uye.id || uye.roles.cache.has(g))))) return true
             else return false;
}

client.on("disconnect", () => console.log("Bot bağlantısı kesildi"))
client.on("reconnecting", () => console.log("Bot tekrar bağlanıyor..."))
client.on("error", e => console.log(e))
client.on("warn", info => console.log(info));

client.login(Options.token).then(c => console.log(`${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
