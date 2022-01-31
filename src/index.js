const { Client, MessageEmbed } = require("discord.js"),
  config = require("./config.json"),
  client = new Client({
    allowedMentions: {
      parse: ["roles", "everyone", "users"],
      repliedUser: false,
    },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_BANS",
      "GUILD_INTEGRATIONS",
      "GUILD_WEBHOOKS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_PRESENCES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING",
    ],
  });
const data = require("./json/data.json");
const data2 = require("./json/data2.json");
const data3 = require("./json/data3.json");
const { parse } = require("tldts");
const ping = require("ping");

let blocklist = new Set();
data.domains.forEach((domain) => blocklist.add(domain));
data2.domains.forEach((domain) => blocklist.add(domain));

client.on("ready", () => {
  console.log("Stopping scams in your server!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  let msgtnc = `${message.content.toLowerCase().split(" ")}`;
  let msgtncc = `${message.content.toLowerCase()}`;

  av = msgtnc.split("https://")[1];
  ak = msgtnc.split("http://")[1];
  va = parse(av);
  vk = parse(ak);
  msgContent = va["domain"] || vk["domain"];

  if (["null", null].includes(msgContent)) msgContent='Check messagecontent'

  let delteMe = config.Config.DeleteMessage;
  let kickedUser = config.Config.KickUser;
  let kickable = "Kicked User";
  let kickMember = await message.guild.members.fetch(message.author.id);

  if (kickedUser) kickable = "Disabled";

  if (blocklist.has(msgContent)) {
    delteMe = true;
  }
  if (config.Config.CheckPhrases === true) { 
  if ([data3.domains].some((x) => x.includes(msgtncc))) {
    delteMe = true;
  }
  } else if (config.Config.CheckPhrases === false) {
      delteMe = false;
      kickedUser = false;
  }

  if (delteMe) {
    if (!kickMember.kickable) kickable = "Unable to kick";
    ping.sys.probe(msgContent, function (isAlive) {
      const embed = new MessageEmbed()
        .setAuthor({
          name: `${message.author.username} Sent a scam link/phrase!`,
          iconURL: `${message.author.displayAvatarURL({
            dynamic: false,
            size: 1024,
          })}`,
        })
        .addFields(
          {
            name: `Username`,
            value: `\`\`\`${message.author.username}#${message.author.discriminator}\`\`\``,
            inline: true,
          },
          {
            name: `UserID`,
            value: `\`\`\`${message.author.id}\`\`\``,
            inline: true,
          },
          { name: `Link`, value: `\`\`\`${msgContent}\`\`\`` },
          {
            name: `Site Up?`,
            value: `\`\`\`${isAlive ? "true" : "false"}\`\`\``,
            inline: true,
          },
          {
            name: `Kicked User?`,
            value: `\`\`\`${kickedUser}\`\`\``,
            inline: true,
          },
          { name: `Full Message`, value: `\`\`\`: ${message.content}\`\`\`` }
        )
        .setColor(`2F3136`);

      const sChannel = message.guild.channels.cache.get(
        config.Config.logChannel
      );
      sChannel.send({ embeds: [embed] });
    });
    message.delete().catch(() => {});
  }
  if (kickedUser) {
    kickMember.kick("Sent a scam link");
  }
});

client.login(config.Identity.token);
