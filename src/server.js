import { Client, Events, GatewayIntentBits, ChannelType } from "discord.js";
import { CronJob } from "cron";
import makeQuestion from "./gpt.js";

let botChannelId;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const channel = client.channels.cache.find(
    (x) => x.name === process.env.botChannelName
  );
  botChannelId = channel.id;
  if (!channel) return console.error("Canal não encontrado.");
  executeCron(channel);
});

client.on(Events.MessageCreate, async (message) => {
  const { bot } = message.author;
  const authorId = message.author.id;
  const channelId = message.channelId.toString();
  let thread;

  if (bot) return; // Ignore bot messages

  if (
    (!message.channel.isThread() && channelId !== botChannelId) ||
    (message.channel.isThread() && message.channel.parent.id !== botChannelId)
  )
    return; // Ignore messages from other channels

  if (!message.channel.isThread()) {
    thread = await message.channel.threads.create({
      name: `${message.content.slice(0, 100)}`,
      autoArchiveDuration: 60,
      reason: "Needed a separate thread for food",
      type: ChannelType.PrivateThread,
    });

    thread.members.add(authorId);
    await thread.send(`Pergunta Realizada: **${message.content}**`);
    await message.delete();
  }

  await threadResponse(message.content, thread || message.channel);
});

client.login(process.env.token);

async function threadResponse(question, thread) {
  let answer = await chatGPT(question);
  answer = "**Resposta**: " + answer;
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

function executeCron(channel) {
  new CronJob(
    "0 */2 * * *",
    function () {
      channel.threads.cache.forEach((element) => {
        const data = new Date(element._createdTimestamp);
        data.setHours(data.getHours() + 6);

        if (data < new Date()) element.delete();
      });
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}
