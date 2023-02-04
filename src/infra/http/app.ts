import express from "express";
import { router } from "./router";
import { Discord } from "@infra/modules/discord";
const app = express();

app.use(router);

console.log(process.env.botChannelName);
new Discord(process.env.botChannelName);
export { app };
