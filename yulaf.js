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

client.on('guildUpdate', async (oldGuild, newGuild) => {
if (oldGuild.vanityURLCode != newGuild.vanityURLCode) {
let entry = await newGuild.fetchAuditLogs({type: 'GUILD_UPDATE'}).then(audit => audit.entries.first());
if (!entry.executor || entry.executor.id === client.user.id) return;
let channel = client.channels.cache.find(channel => channel.name === Options.sunuculog)
if (channel) channel.send(`📕 ${entry.executor} adlı kişi url'yi çalmaya çalıştığı için banlandı ve url eski haline getirildi.`)
if (!channel) newGuild.owner.send(`📕 ${entry.executor} adlı kişi url'yi çalmaya çalıştığı için banlandı ve url eski haline getirildi.`)
cezalandir(entry.executor.id, "ban");
ytKapat("798999362176155718"); //ytleri kapatacagi rol idsini girin
const settings = {
url: `https://discord.com/api/v6/guilds/${newGuild.id}/vanity-url`,
body: {
  code: urlguard.Vanity_URL
},
json: true,
method: 'PATCH',
headers: {
  "Authorization": `Bot ${Options.token}`
}
};

request(settings, (err, res, body) => {
if (err) {
  return console.log(err);
}
});
}});

client.on("guildMemberAdd", async member => {
  let entry = await member.guild.fetchAuditLogs({type: 'BOT_ADD'}).then(audit => audit.entries.first());
  if (!member.user.bot || !entry || !entry.executor || guvenli(entry.executor.id)) return;
  cezalandir(entry.executor.id, "ban");
  cezalandir(member.id, "ban");
  let logKanali = client.channels.cache.find(channel => channel.name === Options.sunuculog)
  if (logKanali) { logKanali.send(
    new MessageEmbed()
    .setColor("2f3136")
    .setAuthor('Sunucuya Bot Eklendi!')
    .setDescription(`📒 ${entry.executor} - (\`${entry.executor.id}\`) tarafından **${member}** - (\`${member.id}\`) botu sunucuya eklendi!`)
    .setFooter(` ❤️ Floxy`)
    .setTimestamp()
    );
    ytKapat("798999362176155718"); //ytleri kapatacagi rol idsini girin
   }
});


client.on("guildUpdate", async (oldGuild, newGuild) => {
  let entry = await newGuild.fetchAuditLogs({type: 'GUILD_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id)) return;
  cezalandir(entry.executor.id, "ban");
  if (newGuild.name !== oldGuild.name) newGuild.setName(oldGuild.name);
  if (newGuild.region !== oldGuild.region) newGuild.setRegion(oldGuild.region);
  if (newGuild.iconURL({dynamic: true, size: 2048}) !== oldGuild.iconURL({dynamic: true, size: 2048})) newGuild.setIcon(oldGuild.iconURL({dynamic: true, size: 2048}));
  let sunucuyusal = client.channels.cache.find(channel => channel.name === Options.sunuculog)
  if (sunucuyusal) { sunucuyusal.send(new MessageEmbed()
    .setColor("2f3136")
    .setAuthor('Sunucu Güncellendi!')
    .setDescription(`📕 ${entry.executor} - (\`${entry.executor.id}\`) tarafından sunucu güncellendi!`)
    .setFooter(` ❤️ Floxy`)
    .setTimestamp()
    );
    ytKapat("798999362176155718"); //ytleri kapatacagi rol idsini girin
  };
});


client.login(Options.token).then(c => console.log(`${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
