import { Client, Events, GatewayIntentBits, ChannelType } from "discord.js";
import makeQuestion from "./gpt.js";

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

client.on(Events.MessageCreate, async (message) => {
  const { bot, username, discriminator } = message.author;
  const channelId = message.channelId.toString();
  let thread;

  if (bot) return; // Ignore bot messages

  if (
    (!message.channel.isThread() && channelId !== "1005196374725361775") ||
    (message.channel.isThread() &&
      message.channel.parent.id !== "1005196374725361775")
  )
    return; // Ignore messages from other channels

  if (!message.channel.isThread()) {
    thread = await message.channel.threads.create({
      name: `${message.content.slice(0, 100)}`,
      autoArchiveDuration: 60,
      reason: "Needed a separate thread for food",
      // type: ChannelType.PrivateThread,
    });

    await thread.send(`Pergunta Realizada: ${message.content}`);
    message.channel.send("Thread Aberta!");
  }

  await threadResponse(message.content, thread || message.channel);
});

client.login(process.env.token);

async function threadResponse(question, thread) {
  const answer = await chatGPT(question);
  const splittedAnswer = splitText(answer, 2000);

  for (var i in splittedAnswer) {
    await thread.send(splittedAnswer[i]);
  }
}

async function chatGPT(question) {
  const answer = await makeQuestion(question);

  return answer;
}

function splitText(text, maxLength) {
  if (text.length <= maxLength) {
    return [text];
  }
  let lastSpace = text.lastIndexOf(" ", maxLength);
  let splittedText = text.substring(0, lastSpace);
  let remainingText = text.substring(lastSpace + 1);

  return [splittedText, ...splitText(remainingText, maxLength)];
}
