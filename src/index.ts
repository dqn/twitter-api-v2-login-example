import { TwitterApi } from "twitter-api-v2";
import express from "express";

const clientId = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const clientSecret = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const callbackUrl = "http://localhost:3000";

async function main() {
  const client = new TwitterApi({
    clientId: clientId,
    clientSecret: clientSecret,
  });

  const { url, codeVerifier } = client.generateOAuth2AuthLink(callbackUrl, {
    scope: ["tweet.read", "users.read", "offline.access"],
  });

  console.log(url);

  const twitter = await new Promise<TwitterApi>((resolve, reject) => {
    const app = express();

    app.get("/", (req, res) => {
      const code = req.query["code"]?.toString() ?? "";

      client
        .loginWithOAuth2({
          code,
          codeVerifier,
          redirectUri: callbackUrl,
        })
        .then(({ client, accessToken, refreshToken, expiresIn }) => {
          console.log(accessToken, refreshToken, expiresIn);
          res.status(200).send("ok");
          resolve(client);
        })
        .catch((err) => {
          res.status(403).send("Invalid verifier or access tokens.");
          reject(err);
        })
        .finally(() => {
          server.close();
        });
    });

    const server = app.listen(3000);
  });

  const { data } = await twitter.v2.me();
  console.log(data);
}

await main();
