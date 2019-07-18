import { App, AppMentionEvent, Context, MessageEvent } from "@slack/bolt";
import { getHistory, getImage } from "./request";
import { postTwitter, postTwitterWithImage } from "./ifttt";
import { uploadImage } from "./imgur";
import * as emoji from "node-emoji";

export const mentionRoute = async (
  app: App,
  event: AppMentionEvent,
  context: Context
) => {
  if (guard(event)) {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: "権限がありません"
    });
    return;
  }

  if (!event.thread_ts) {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: "メェ〜"
    });
    return;
  } else if (event.text.match(postPhrase())) {
    const [threadRoot]: MessageEvent[] = await getHistory(
      process.env.SLACK_OAUTH_TOKEN,
      {
        channel: event.channel
      }
    )
      .then(x => x.messages as Array<MessageEvent>)
      .then(xs => xs.filter(x => x.ts === event.thread_ts));

    threadRoot.text = emoji.emojify(threadRoot.text);
    if (threadRoot.text.length > 140) {
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: event.channel,
        text: "140文字以上だメェ〜",
        thread_ts: event.thread_ts
      });
      return;
    }

    await post(threadRoot);
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: `\`${threadRoot.text}\` とTwitterに投稿しましたメェ〜`,
      thread_ts: event.thread_ts
    });
  } else {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: "メンションをつけて `投稿して` と言ってくださいメェ〜",
      thread_ts: event.thread_ts
    });
  }
};

const guard = (event: AppMentionEvent): boolean => {
  return [event.channel !== process.env.SLACK_ENABLE_CHANNEL].some(x => x);
};

const post = async (threadRoot: MessageEvent) => {
  if (threadRoot.files) {
    const imageURL = threadRoot.files[0].url_private;
    const imageRespons = await getImage(
      process.env.SLACK_OAUTH_TOKEN,
      imageURL
    ).then(x => x.buffer());

    const uploadResult = await uploadImage(
      process.env.IMGUR_CLIENT_ID,
      imageRespons
    ).then(x => x.json());

    await postTwitterWithImage(process.env.IFTTT_KEY, {
      value1: threadRoot.text,
      value2: uploadResult.data.link
    });
  } else {
    await postTwitter(process.env.IFTTT_KEY, {
      value1: threadRoot.text
    });
  }
};

const postPhrase = () => {
  const phrase = [
    "投稿",
    "とうこう",
    "呟く",
    "つぶやく",
    "呟いて",
    "つぶやいて",
    "Tweet",
    "tweet"
  ];

  return new RegExp(phrase.join("|"));
};
