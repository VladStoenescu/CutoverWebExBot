require('dotenv').config();
const express = require('express');
const axios = require('axios');

// Validate required environment variables
if (!process.env.WEBEX_BOT_TOKEN) {
  console.error('ERROR: WEBEX_BOT_TOKEN is required. Please set it in your .env file.');
  console.error('See .env.example for reference.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL;
const WEBEX_API_BASE = 'https://webexapis.com/v1';

// Axios instance for Webex API
const webexAPI = axios.create({
  baseURL: WEBEX_API_BASE,
  headers: {
    'Authorization': `Bearer ${process.env.WEBEX_BOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Initialize Express server for webhook
const app = express();
app.use(express.json());

// Cutover knowledge base
const cutoverKnowledge = {
  'what is cutover': 'Cutover is a collaborative platform designed to help organizations plan, execute, and manage complex technology operations and migrations. It provides real-time visibility, automation, and communication tools to ensure smooth transitions.',
  'cutover features': 'Key Cutover features include: \n- Real-time runbook automation\n- Task orchestration and scheduling\n- Collaboration and communication tools\n- Audit trails and compliance tracking\n- Integration with ITSM and DevOps tools\n- Risk management and contingency planning',
  'cutover benefits': 'Benefits of using Cutover:\n- Reduced downtime and risk\n- Improved team collaboration\n- Better visibility and control\n- Faster execution of complex operations\n- Comprehensive audit trails\n- Repeatable and scalable processes',
  'how to use cutover': 'To use Cutover:\n1. Create a runbook with tasks and dependencies\n2. Assign team members to tasks\n3. Set up automated workflows and integrations\n4. Execute the runbook during your cutover window\n5. Monitor progress in real-time\n6. Communicate with stakeholders through integrated tools\n7. Review and analyze post-execution reports',
  'cutover vs traditional': 'Cutover differs from traditional methods by:\n- Replacing spreadsheets and emails with a unified platform\n- Providing real-time collaboration instead of fragmented communication\n- Automating tasks instead of manual execution\n- Offering detailed audit trails vs. limited documentation\n- Enabling proactive risk management vs. reactive problem solving'
};

// Function to find best matching answer
function getAnswer(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Direct keyword matching
  for (const [key, value] of Object.entries(cutoverKnowledge)) {
    if (lowerQuestion.includes(key)) {
      return value;
    }
  }
  
  // Fallback response
  return "I'm a Cutover bot! I can help answer questions about:\n" +
         "- What is Cutover?\n" +
         "- Cutover features and benefits\n" +
         "- How to use Cutover\n" +
         "- Cutover vs traditional methods\n\n" +
         "Just ask me any question related to these topics!";
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Webex Cutover Bot is running!');
});

// Webhook endpoint for incoming messages
app.post('/webhook', async (req, res) => {
  try {
    const webhook = req.body;
    
    // Acknowledge receipt immediately
    res.status(200).send('OK');
    
    // Only process messages (not other events)
    if (webhook.resource !== 'messages' || webhook.event !== 'created') {
      return;
    }
    
    // Get the message details
    const messageResponse = await webexAPI.get(`/messages/${webhook.data.id}`);
    const message = messageResponse.data;
    
    // Get the bot's information
    const botResponse = await webexAPI.get('/people/me');
    const botInfo = botResponse.data;
    
    // Ignore messages from the bot itself
    if (message.personEmail === botInfo.emails[0]) {
      return;
    }
    
    // Process the message - extract text and remove bot mention
    let messageText = message.text || '';
    
    // Remove bot mention from the message
    if (botInfo.displayName) {
      messageText = messageText.replace(new RegExp(`@?${botInfo.displayName}`, 'gi'), '').trim();
    }
    
    if (!messageText) {
      return; // Empty message after removing mention
    }
    
    console.log(`Received message: "${messageText}" from ${message.personEmail}`);
    
    // Get answer based on the question
    const answer = getAnswer(messageText);
    
    // Send response
    await webexAPI.post('/messages', {
      roomId: message.roomId,
      text: answer
    });
    
    console.log('Response sent successfully');
    
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Webex Cutover Bot server listening on port ${PORT}`);
  
  try {
    // Verify bot credentials
    const response = await webexAPI.get('/people/me');
    const botInfo = response.data;
    console.log(`Bot authenticated as: ${botInfo.displayName} (${botInfo.emails[0]})`);
    
    if (PUBLIC_URL) {
      console.log(`\nWebhook URL: ${PUBLIC_URL}/webhook`);
      console.log('\nTo set up webhooks, visit: https://developer.webex.com/docs/api/v1/webhooks/create-a-webhook');
      console.log('Or use the Webex API to create a webhook pointing to your PUBLIC_URL/webhook');
    } else {
      console.log('\nWARNING: PUBLIC_URL not set. Webhooks will not work without it.');
      console.log('Set PUBLIC_URL in your .env file to enable webhook functionality.');
    }
    
  } catch (error) {
    console.error('Failed to authenticate bot. Please check your WEBEX_BOT_TOKEN.');
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error message:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
});
