import fetch from "node-fetch";

type IFTTTEvent = "TWITTER_POST" | "TWITTER_POST_WITH_IMAGE";
const TWITTER_EVENT = "TWITTER_POST";
const TWITTER_POST_IMAGE = "TWITTER_POST_WITH_IMAGE";

type IFTTTPayload = {
  value1: string;
  value2?: string;
  value3?: string;
};

const ENDPOINT = "https://maker.ifttt.com/trigger";

export const postTwitter = async (key: string, payload: IFTTTPayload) =>
  request(key, TWITTER_EVENT, payload);

export const postTwitterWithImage = async (
  key: string,
  payload: IFTTTPayload
) => request(key, TWITTER_POST_IMAGE, payload);

const request = async (
  key: string,
  event: IFTTTEvent,
  payload: IFTTTPayload
) => {
  const url = `${ENDPOINT}/${event}/with/key/${key}`;
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json"
    }
  });
};
