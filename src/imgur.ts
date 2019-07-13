import fetch from "node-fetch";
import FormData from "form-data";

const ENDPOINT = "https://api.imgur.com/3/image";
export const uploadImage = (clientID: string, image: Buffer) => {
  const data = new FormData();
  data.append("image", image);

  return fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Client-ID ${clientID}` },
    body: data
  });
};
