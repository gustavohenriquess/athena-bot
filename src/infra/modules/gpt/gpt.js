import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.gpt_key,
});

const openai = new OpenAIApi(configuration);

async function makeQuestion(question) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: question,
    temperature: 0,
    max_tokens: 4000,
  });

  return response.data.choices[0].text;
}
export default makeQuestion;
