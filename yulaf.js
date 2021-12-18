const { Discord, Client, MessageEmbed, Webhook } = require('discord.js');
const client = global.client = new Client({fetchAllMembers: true});
const fs = require('fs');

let Options = {
  "KanalK": "channel-log", //kanal log ismi id girmeyin aptal botçu olmayın ismi yazin birakin
  "webhookkoruma": "", //webhook log ismi id girmeyin vala
  "token": "", //bot token
  "seskanalismi": "", //ses kanal ismi
  "whitelist": [""]
}

let kurucu = {
  "botOwner": "", //owner id
  "guildID": "", //sunucu id
  "botPrefix": "" //prefix
}

process.on('uncaughtException', function(err) { 
  console.log(err) 
});

client.on("ready", async () => {
  client.user.setPresence({activity: {name: 'Mavera ❤️ Floxy'}, status: 'invisible'}); //Bot durum, oynuyor //idle: boşta, online: çevrimiçi, dnd: rahatsız etmeyin, invisible: görünmez \\ 
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
  if (tur == "ban") return uye.ban({days: 7, reason: "Floxy Channel Guard" }).catch();
};
// Güvenli kişi fonksiyonu
function guvenli(kisiID) {
  let uye = client.guilds.cache.get(kurucu.guildID).members.cache.get(kisiID);
  let guvenliler = Options.whitelist || [];
  if (!uye || uye.id === client.user.id || uye.id === Options.botOwner || uye.id === uye.guild.owner.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
};

client.on("webhookUpdate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'WEBHOOK_CREATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id)) return;
  cezalandir(entry.executor.id, "ban");
  let webhookgoruma = client.channels.cache.find(channel => channel.name === Options.webhookkoruma);
  if (webhookgoruma) {webhookgoruma.send(
    new MessageEmbed()
    .setColor("2f3136")
    .setAuthor('Bir Webhook Oluşturuldu!')
    .setDescription(`📗 Oluşturan kullanıcı: ${entry.executor} - (\`${entry.executor.id}\`) oluşturan kişiyi yasakladım!`)
    .setFooter(`Mavera ❤️ Floxy`)
    .setTimestamp()
 );
 
}
});


client.on("channelUpdate", async (oldChannel, newChannel) => {
  let entry = await newChannel.guild.fetchAuditLogs({type: 'CHANNEL_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || !newChannel.guild.channels.cache.has(newChannel.id) || guvenli(entry.executor.id)) return;
  cezalandir(entry.executor.id, "ban");
  if (newChannel.type !== "category" && newChannel.parentID !== oldChannel.parentID) newChannel.setParent(oldChannel.parentID);
  if (newChannel.type === "category") {
    newChannel.edit({
      name: oldChannel.name,
    });
  } else if (newChannel.type === "text") {
    newChannel.edit({
      name: oldChannel.name,
      topic: oldChannel.topic,
      nsfw: oldChannel.nsfw,
      rateLimitPerUser: oldChannel.rateLimitPerUser
    });
  } else if (newChannel.type === "voice") {
    newChannel.edit({
      name: oldChannel.name,
      bitrate: oldChannel.bitrate,
      userLimit: oldChannel.userLimit,
    });
  };
  oldChannel.permissionOverwrites.forEach(perm => {
    let thisPermOverwrites = {};
    perm.allow.toArray().forEach(p => {
      thisPermOverwrites[p] = true;
    });
    perm.deny.toArray().forEach(p => {
      thisPermOverwrites[p] = false;
    });
    newChannel.createOverwrite(perm.id, thisPermOverwrites);
  });
  let kanallaraelleme = client.channels.cache.find(channel => channel.name === Options.KanalK);
  if (kanallaraelleme) { kanallaraelleme.send(
    new MessageEmbed()
    .setColor("2f3136")
    .setAuthor('Bir Kanal/Kategori Güncellendi!')
    .setDescription(`📒 ${entry.executor} - (\`${entry.executor.id}\`) tarafından **${oldChannel.name}** kanalı güncellendi!`)
    .setFooter(`Mavera ❤️ Floxy`)
    .setTimestamp()
  );
};
  
});

client.on("channelDelete", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id)) return;
  cezalandir(entry.executor.id, "ban");
  await channel.clone({ reason: " Kanal Guard" }).then(async kanal => {
    if (channel.parentID != null) await kanal.setParent(channel.parentID);
    await kanal.setPosition(channel.position);
    if (channel.type == "category") await channel.guild.channels.cache.filter(k => k.parentID == channel.id).forEach(x => x.setParent(kanal.id));
  });
  let kanallaraelleme = client.channels.cache.find(channel => channel.name === Options.KanalK);
  if (kanallaraelleme) { kanallaraelleme.send(
    new MessageEmbed()
    .setColor("2f3136")
    .setAuthor('Bir Kanal Silindi!')
    .setDescription(`📕 ${entry.executor} - (\`${entry.executor.id}\`) tarafından **${channel.name}** kanalı silindi!`)
    .setFooter(`Mavera ❤️ Floxy`)
    .setTimestamp()
  ); 
  
};
});


client.login(Options.token).then(c => console.log(`${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));