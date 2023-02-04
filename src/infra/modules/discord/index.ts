import {
  Client,
  GatewayIntentBits,
  Events,
  Channel,
  ChannelType,
  ThreadChannel,
} from "discord.js";
import { CronJob } from "cron";

export class Discord {
  private botChannelId: string;
  private botChannelName: string;
  private client: Client;

  constructor(botChannelName: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });

    this.botChannelName = botChannelName;

    this.start();
    this.client.login(process.env.token);
  }

  public async start() {
    this.client.on(Events.ClientReady, async () => {
      const channel = this.client.channels.cache.find(
        (x: any) => x.name === process.env.botChannelName
      );
      if (!channel) return console.error("Canal não encontrado.");
      this.botChannelId = channel.id;
      this.executeCron(channel);
      console.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on(Events.MessageCreate, async (message: any) => {
      const { bot } = message.author;
      const authorId = message.author.id;
      const channelId = message.channelId.toString();
      let thread;

      if (bot) return; // Ignore bot messages

      if (
        (!message.channel.isThread() && channelId !== this.botChannelId) ||
        (message.channel.isThread() &&
          message.channel.parent.id !== this.botChannelId)
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

      await this.threadResponse(message.content, thread || message.channel);
    });
  }

  private executeCron(channel: any) {
    new CronJob(
      "0 */2 * * *",
      function () {
        channel.threads.cache.forEach((thread) => {
          const data = new Date(thread._createdTimestamp);
          data.setHours(data.getHours() + 6);

          if (data < new Date()) thread.delete();
        });
      },
      null,
      true,
      "America/Sao_Paulo"
    );
  }

  private splitText(text: string, maxLength: number) {
    if (text.length <= maxLength) {
      return [text];
    }
    let lastSpace = text.lastIndexOf(" ", maxLength);
    let splittedText = text.substring(0, lastSpace);
    let remainingText = text.substring(lastSpace + 1);

    return [splittedText, ...this.splitText(remainingText, maxLength)];
  }

  private async threadResponse(question: string, thread) {
    let answer: string = "Texto de retorno"; //await chatGPT(question);
    answer = "**Resposta**: " + answer;
    const splittedAnswer = this.splitText(answer, 2000);

    for (var i in splittedAnswer) {
      await thread.send(splittedAnswer[i]);
    }
  }
}
