import { App } from "@slack/bolt";
import { mentionRoute } from "./route";
import * as Env from "dotenv";

if (process.env.NODE_ENV === "dev") Env.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  ignoreSelf: true
});

app.event("app_mention", async ({ event, context }) => {
  try {
    await mentionRoute(app, event, context);
  } catch (e) {
    console.error(e);
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: "エラーが発生しました",
      thread_ts: event.thread_ts
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡ Running Slack Bot with bolts.");
})();
