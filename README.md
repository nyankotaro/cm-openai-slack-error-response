# slack openai stack

## npm install

```bash
npm install
```

## SSM Paramater Storeの準備

事前にOpenAI API Key, Incoming Webhook URLを払い出してSSM Paramater Storeに設定します。

| パラメータ名        | 値                   | 種類         |
| ------------------- | -------------------- | ------------ |
| /openai/api-key     | OpenAI API Key       | SecureString |
| /openai/webhook-url | Incoming Webhook URL | String       |

## openaiパッケージの準備

`lib/`配下に`/assets/openai-layer/python`フォルダを用意しOpenAIパッケージを同梱します。

```bash
pip install openai -t lib/assets/openai-layer/python/
```

## デプロイ

```shell
npx cdk deploy --all
```

## ブログリンク

https://dev.classmethod.jp/articles/openai-slack-error-response
