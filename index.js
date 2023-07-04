const Discord = require('discord.js');
const umutmta = require('gamedig');
const umutconfig = require('./config.json');

const umutbot = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS]
});
const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const {
    config
} = require('process');
const {
    channel
} = require('diagnostics_channel');

const commands = [
        new SlashCommandBuilder().setName('sunucu').setDescription('Sunucu istatistiğini gönderir'),
    ]
    .map(command => command.toJSON());

const rest = new REST({
    version: '9'
}).setToken(umutconfig.token);

umutbot.once('ready', () => {
    console.log(`Girdi: ${umutbot.user.tag}`);
    setInterval(() => {
        umutmta.query({
            type: 'mtasa',
            host: umutconfig.server_ip,
            port: umutconfig.server_port
        }).then((state) => {

            umutbot.channels.cache.get(umutconfig.playerChannel).setName(`Oyuncular: ${state.raw.numplayers}/${state.maxplayers}`) // Kanal ile oyuncuları gösterme.

            umutbot.user.setActivity(`Oyuncular: ${state.raw.numplayers}/${state.maxplayers}`);
            console.log("Oynuyor ve oyuncular kanalı güncellendi."); // Başına // ekleyerek durdurabilirsiniz, ya da direk silebilirsiniz.
        }).catch(err => {
            console.log(err);
        });
    }, 25000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(umutbot.user.id, umutconfig.guildId), {
                    body: commands
                },
            );

            console.log('Uygulama komutları başarıyla kuruldu.');
        } catch (error) {
            console.error(error);
        }
    })();
});


umutbot.on('interactionCreate', async umutmsg => {
    if (!umutmsg.isCommand()) return;

    const {
        commandName
    } = umutmsg;

    if (commandName === 'sunucu') {
        umutmta.query({
            type: 'mtasa',
            host: umutconfig.server_ip,
            port: umutconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var umutembed = new Discord.MessageEmbed()
                .setTitle(state.name)
                .setColor(`BLUE`)
                .addField(`Harita:`, `${state.map ? state.map : "Bulunamadı"}`, true)
                .addField(`Oyun tipi:`, `${state.raw.gametype}`, true)
                .addField(`Geliştirici:`, `${state.raw.Developer || "Bulunamadı"}`, true)
                .addField(`Oyuncular:`, `${state.raw.numplayers || "0"}/${state.maxplayers}`, true)
                .addField(`Ping:`, `${state.ping}ms`, true)
                .addField(`IP:`, `${state.connect}`, true)
                .setTimestamp()
                .setFooter(`${umutmsg.member.user.tag} tarafından istendi`, umutmsg.member.user.avatarURL());

            await umutmsg.reply({
                embeds: [umutembed]
            });
        }).catch(err => {
            console.log(err);
        });
    }
});

umutbot.login(umutconfig.token);
