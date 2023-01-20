import { config } from "dotenv-flow";
config();
import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, (message) => {
  const { bot, username, discriminator } = message.author;
  const channelId = message.channelId.toString();

  if (bot) return; // Ignore bot messages
  console.log(channelId);

  if (channelId !== "981268941705982045") return; // Ignore messages from other channels
  console.log(message.content.length);
  console.log(message);

  message.channel.send("response");
});

console.log(process.env.token);
client.login(process.env.token);
