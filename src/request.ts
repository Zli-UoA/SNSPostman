import { WebClient } from "@slack/web-api";
import { ChannelsHistoryArguments } from "@slack/web-api";
import fetch from "node-fetch";

export const getHistory = async (
  token: string,
  option?: ChannelsHistoryArguments
) => {
  const client = new WebClient(token);
  return client.channels.history(option);
};

export const getImage = async (token: string, url: string) => {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
