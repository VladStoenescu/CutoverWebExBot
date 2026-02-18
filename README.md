# CutoverWebExBot

A WebEx Bot that answers questions about Cutover - a collaborative platform for managing complex technology operations and migrations.

## Features

- Responds to questions about Cutover in WebEx Teams
- Easy configuration via environment variables
- Quick access token updates through .env file
- Knowledge base covering:
  - What is Cutover
  - Cutover features and benefits
  - How to use Cutover
  - Comparison with traditional methods

## Prerequisites

- Node.js (v14 or higher)
- A WebEx Bot account and access token
- Public URL for webhooks (use ngrok for local development)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VladStoenescu/CutoverWebExBot.git
   cd CutoverWebExBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and set your values:
   - `WEBEX_BOT_TOKEN`: Your WebEx Bot access token (get it from https://developer.webex.com/my-apps)
   - `PORT`: Port for the webhook server (default: 3000)
   - `PUBLIC_URL`: Your public URL for webhooks (e.g., https://your-domain.ngrok.io)

4. **Get your WebEx Bot Token**
   - Go to https://developer.webex.com/my-apps
   - Create a new bot or use an existing one
   - Copy the Bot Access Token
   - Paste it in your `.env` file as `WEBEX_BOT_TOKEN`

5. **Set up a public URL (for local development)**
   ```bash
   # Install ngrok if you haven't already
   npm install -g ngrok
   
   # Start ngrok on the same port as your bot
   ngrok http 3000
   ```
   
   Copy the HTTPS URL from ngrok and set it as `PUBLIC_URL` in your `.env` file.

## Running the Bot

```bash
npm start
```

The bot will start and display:
- Server status
- Bot authentication information
- Webhook URL for configuration

## Setting Up Webhooks

After starting the bot, you need to create a webhook in WebEx:

1. Go to https://developer.webex.com/docs/api/v1/webhooks/create-a-webhook
2. Create a webhook with:
   - **name**: "Cutover Bot Webhook"
   - **targetUrl**: Your `PUBLIC_URL/webhook` (e.g., https://abc123.ngrok.io/webhook)
   - **resource**: "messages"
   - **event**: "created"

Alternatively, you can use curl:
```bash
curl -X POST https://webexapis.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cutover Bot Webhook",
    "targetUrl": "https://your-public-url.ngrok.io/webhook",
    "resource": "messages",
    "event": "created"
  }'
```

## Updating the Bot Access Token

The bot is designed for easy token updates:

1. Open the `.env` file
2. Replace the value of `WEBEX_BOT_TOKEN` with your new token
3. Restart the bot with `npm start`

No code changes required!

## Usage

Once the bot is running and webhooks are configured:

1. Add the bot to a WebEx space
2. Mention the bot and ask a question:
   - "@BotName what is cutover?"
   - "@BotName what are cutover features?"
   - "@BotName what are the benefits of cutover?"
   - "@BotName how to use cutover?"
   - "@BotName cutover vs traditional methods?"

The bot will respond with relevant information about Cutover.

## Extending the Bot

To add more knowledge to the bot:

1. Open `index.js`
2. Find the `cutoverKnowledge` object
3. Add new question-answer pairs
4. Restart the bot

Example:
```javascript
const cutoverKnowledge = {
  'your question keyword': 'Your detailed answer here',
  // ... existing entries
};
```

## Troubleshooting

**Bot doesn't respond:**
- Verify your `WEBEX_BOT_TOKEN` is correct
- Check that webhooks are properly configured
- Ensure your `PUBLIC_URL` is accessible from the internet
- Check the bot logs for error messages

**"WEBEX_BOT_TOKEN is required" error:**
- Make sure you have a `.env` file in the project root
- Verify the token is set correctly in the `.env` file

**Webhook errors:**
- Ensure your PUBLIC_URL is correct and accessible
- Verify ngrok is running if using local development
- Check that the webhook is created with the correct targetUrl

## License

ISC