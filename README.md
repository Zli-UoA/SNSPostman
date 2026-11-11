# SNSPostman

## Discription

Slackの投稿にメンションをつけるとTwitterに投稿してくれるBotです

## How to start

### Develop

- 開発・ビルドにはNode 24を使用します（配布bundleの実行対象はNode 10）。
- `npm ci`
- `.env` ファイルに下記の環境変数を記入
- `npm run dev` で監視ビルドし、別ターミナルで `npm start` を実行
- `npm test` でビルドと外部送信をmockしたbundle起動・署名検証を実行
- 配布前に `npm run build` で `dist/main.js` を再生成

### Production

好きなサーバーにNode環境を作ってDeployするか，dockerfileを元にDockerImageを作成して
CloudRun等にDeployしてください.

## Environment Valiables

- SLACK_SIGNING_SECRET : Slack のSigning Secret
- SLACK_BOT_TOKEN : Slack の bot token
- SLACK_OAUTH_TOKEN : Slack の OAuth Token
- SLACK_ENABLE_CHANNEL : 有効にするチャンネル
- IFTTT_KEY : IFTTT の Webhook key
- IMGUR_CLIENT_ID : IMGUR の ClientID

## How to use

環境変数で有効にしたチャンネルで投稿にメンションをつけて 「投稿して」と投稿する

- 有効なフレーズ
  - 投稿
  - とうこう
  - Tweet
  - tweet
  - 呟く
  - つぶやく
  - 呟いて
  - つぶやい

