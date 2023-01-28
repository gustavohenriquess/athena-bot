import { randomInt } from "node:crypto";
import { config } from "dotenv-flow";
config();
import { Client, Events, GatewayIntentBits, ChannelType } from "discord.js";

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
  }

  await threadResponse(message.content, thread);

  message.channel.send("Thread Aberta!");
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
  const answer = [
    `1 vida é cheia de surpresas e desafios, mas é importante lembrar de sempre buscar o equilíbrio e a felicidade. É fácil se perder em meio à correria do dia a dia e se esquecer dos pequenos prazeres da vida. É preciso encontrar tempo para se divertir, passar tempo com amigos e familiares, e fazer coisas que nos dão prazer.

  Uma das chaves para encontrar esse equilíbrio é estabelecer metas e objetivos. Isso pode ser algo tão simples quanto ler um livro por mês ou tão ambicioso quanto completar uma maratona. O importante é ter algo para trabalhar e se esforçar para alcançá-lo.
  
  Outra maneira de encontrar equilíbrio é praticar meditação ou yoga. Essas práticas ajudam a acalmar a mente e o corpo, o que pode ser extremamente útil em momentos de estresse. Elas também podem ajudar a encontrar uma maior consciência de si mesmo e do mundo ao seu redor.
  
  É importante lembrar de ser gentil consigo mesmo e ter paciência. A vida é uma jornada e não há necessidade de se sentir pressionado a alcançar tudo imediatamente. Dê a si mesmo tempo para crescer e evoluir, e sempre lembre de celebrar as pequenas vitórias ao longo do caminho.
  
  Em resumo, encontrar equilíbrio e felicidade na vida é possível, mas requer esforço e dedicação. É importante estabelecer metas, praticar técnicas de relaxamento e ser gentil consigo mesmo. Lembre-se de celebrar as pequenas vitórias e desfrutar dos prazeres simples da vida.`,

    `2 vida é uma jornada complexa e cheia de desafios, mas também é repleta de oportunidades e alegrias. É importante encontrar um equilíbrio entre as responsabilidades diárias e o tempo para se divertir e desfrutar da vida.

  Uma das maneiras de encontrar esse equilíbrio é estabelecer metas e objetivos. Isso pode ser algo tão simples quanto ler um livro por mês ou tão ambicioso quanto completar uma maratona. O importante é ter algo para trabalhar e se esforçar para alcançá-lo. Isso nos dá uma sensação de propósito e realização, e nos ajuda a manter o foco naquilo que é importante.
  
  Outra maneira de encontrar equilíbrio é praticar meditação ou yoga. Essas práticas ajudam a acalmar a mente e o corpo, o que pode ser extremamente útil em momentos de estresse. Elas também podem ajudar a encontrar uma maior consciência de si mesmo e do mundo ao seu redor. A meditação e o yoga podem ajudar a encontrar um sentido de paz interior e tranquilidade, o que é essencial para o bem-estar geral.
  
  É importante também manter relacionamentos saudáveis e positivos. Passar tempo com amigos e familiares é importante para o nosso bem-estar emocional e nos ajuda a lidar com as dificuldades da vida. Também é importante cultivar relacionamentos amorosos saudáveis, pois eles podem fornecer apoio e amor incondicional.
  
  É importante lembrar de ser gentil consigo mesmo e ter paciência. A vida é uma jornada e não há necessidade de se sentir pressionado a alcançar tudo imediatamente. Dê a si mesmo tempo para crescer e evoluir, e sempre lembre de celebrar as pequenas vitórias ao longo do caminho.
  
  E por fim, é importante encontrar coisas que nos dão prazer e nos fazem feliz. Isso pode ser tão simples quanto tomar um café com um amigo ou tão emocionante quanto viajar para um lugar novo. É importante encontrar coisas que nos fazem sentir vivos e nos ajudam a desfrutar da vida.
  
  Em resumo, encontrar equilíbrio e felicidade na vida é possível, mas requer esforço e dedicação. É importante estabelecer metas, praticar técnicas de relaxamento, manter relacionamentos saudáveis, ser gentil cons`,
  ];

  return answer[0];
}

function splitText(text, maxLength) {
  if (text.length <= maxLength) {
    return [text];
  }
  let lastSpace = text.lastIndexOf(" ", maxLength);
  let splittedText = text.substring(0, lastSpace);
  let remainingText = text.substring(lastSpace + 1);

  return [splittedText, splitText(remainingText, maxLength)];
}
