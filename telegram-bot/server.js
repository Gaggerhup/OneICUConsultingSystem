console.log('--- [BOT] Starting Targeted Server Mode ---');
process.on('uncaughtException', (err) => {
    console.error('💥 CRITICAL ERROR (Uncaught):', err.message);
    process.exit(1);
});

console.log('[Debug] Step 1: Importing express...');
const express = require('express');
console.log('[Debug] Step 2: Importing cors...');
const cors = require('cors');
console.log('[Debug] Step 3: Importing node-telegram-bot-api...');
const TelegramBot = require('node-telegram-bot-api');
console.log('[Debug] Step 4: Importing dotenv...');
const dotenv = require('dotenv');
console.log('[Debug] Step 5: Importing path...');
const path = require('path');

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, '../.env');
console.log(`[Debug] Step 6: Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Retrieve Telegram credentials from the environment
const token = process.env.TELEGRAM_BOT_TOKEN;
const defaultChatId = process.env.TELEGRAM_CHAT_ID;
let webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
if (webAppUrl.includes(' -> ')) {
    webAppUrl = webAppUrl.split(' -> ')[0].trim();
}

console.log(`[Debug] Step 7: Variables loaded.`);
console.log(`[Debug] TELEGRAM_BOT_TOKEN: ${token ? 'Found' : 'NOT FOUND'}`);

if (!token) {
    console.error('🚨 ERROR: TELEGRAM_BOT_TOKEN must be set in the .env file.');
    process.exit(1);
}

// --- Registry (In-Memory) ---
const specialistRegistry = {};
const casesRegistry = [
    { id: '101', patientName: 'Johnathan Doe', hospital: 'General City Hospital', status: 'Pending', priority: 'EMERGENCY', date: 'Oct 24, 2024', senderId: 'system_mock' },
    { id: '102', patientName: 'Jane Smith', hospital: 'Memorial Health Center', status: 'Pending', priority: 'URGENT', date: 'Oct 24, 2024', senderId: 'system_mock' },
    { id: '103', patientName: 'Robert Brown', hospital: 'St. Jude Medical Center', status: 'Declined', priority: 'URGENT', date: 'Oct 23, 2024', senderId: 'system_mock' },
    { id: '104', patientName: 'Elena Martinez', hospital: 'Northeast Clinic', status: 'Pending', priority: 'IMMEDIATE', date: 'Oct 23, 2024', senderId: 'system_mock' },
    { id: '105', patientName: 'Sarah Jenkins', hospital: 'Bangkok Hospital', status: 'Active', priority: 'URGENT', date: 'Oct 24, 2024', senderId: 'system_mock', lastAction: 'Reviewing Labs', lastActiveTime: '2m ago' },
    { id: '106', patientName: 'Michael Chen', hospital: 'Siriraj Hospital', status: 'Critical', priority: 'IMMEDIATE', date: 'Oct 24, 2024', senderId: 'system_mock', lastAction: 'Vitals Stabilizing', lastActiveTime: '5m ago' },
    { id: '107', patientName: 'Alice Wong', hospital: 'Chulalongkorn Hospital', status: 'Archived', priority: 'NON-URGENT', date: 'Oct 22, 2024', senderId: 'system_mock' },
];

// Initialize the Telegram bot (polling is false as we only push notifications)
console.log('[Debug] Step 8: Initializing Telegram Bot...');
const bot = new TelegramBot(token, { polling: false });

// 1. Registration Endpoint: Associates a Telegram Chat ID with a Specialist Profile
app.post('/register', (req, res) => {
    const { specialistId, chatId, isAvailable, preferences } = req.body;
    
    if (!specialistId || !chatId) {
        return res.status(400).json({ error: 'Missing specialistId or chatId' });
    }

    specialistRegistry[specialistId] = {
        chatId,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        preferences: Array.isArray(preferences) ? preferences : ['newRequest', 'requestApproved', 'newMessage'], // Default set
        lastSeen: Date.now()
    };

    console.log(`[Registry] Specialist ${specialistId} registered with Chat ${chatId} (Available: ${isAvailable}, Prefs: ${specialistRegistry[specialistId].preferences.join(',')})`);
    res.status(200).json({ success: true, message: 'Registration successful' });
});

// 2. Case List Endpoint: Returns the unified list of cases
app.get('/cases', (req, res) => {
    res.status(200).json(casesRegistry);
});

// 3. Notification Endpoint: Routes messages to all available specialists with matching preferences
app.post('/notify', async (req, res) => {
    try {
        const { caseId, patientName, hospital, priority, type = 'newRequest', specialty, age, gender, reason, senderId } = req.body;
        
        // Persist the case in the global registry so others can see it
        const newCase = {
            id: caseId,
            patientName,
            hospital,
            priority,
            status: 'Pending',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            specialty,
            age,
            gender,
            reason,
            senderId, // Track who sent the request
            type: 'incoming', // Default type for list display
            lastAction: 'Request Submitted',
            lastActiveTime: 'Just now'
        };
        casesRegistry.unshift(newCase);
        
        // Map priority to visual indicator
        let priorityEmoji = '🟡';
        if (priority === 'IMMEDIATE') priorityEmoji = '🔴';
        else if (priority === 'EMERGENCY') priorityEmoji = '🩷';
        else if (priority === 'URGENT') priorityEmoji = '🟠';
        else if (priority === 'SEMI-URGENT') priorityEmoji = '🟢';
        else if (priority === 'NON-URGENT') priorityEmoji = '⚪';

        const message = `🚨 <b>New Consultation Request</b>\n\n` +
                        `<b>Patient:</b> ${patientName}\n` +
                        `<b>Hospital:</b> ${hospital}\n` +
                        `<b>Priority:</b> ${priorityEmoji} ${priority}\n\n` +
                        `Please review this case immediately in the Antigravity portal.`;

        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🏥 Open Antigravity System',
                            web_app: {
                                url: `${webAppUrl}/?caseId=${caseId}&ref=telegram_bot`
                            }
                        }
                    ]
                ]
            }
        };

        // Determine targets: Specialists in registry who are available AND have opted-in for this notification type
        const allSp = Object.values(specialistRegistry);
        const targets = allSp
            .filter(s => s.isAvailable && s.preferences.includes(type))
            .map(s => s.chatId);

        // Fallback to defaultChatId ONLY if NO specialists are registered yet (Cold Start)
        // If specialists exist but the targets array is empty, it means they've opted out or are unavailable
        if (allSp.length === 0 && targets.length === 0 && defaultChatId) {
            targets.push(defaultChatId);
            console.log('[Notify] System cold-start: Falling back to default Chat ID.');
        }

        if (targets.length === 0) {
            console.warn(`[Notify] No specialists opted-in for notification type: ${type}`);
            return res.status(200).json({ success: false, message: 'No matching recipients or all opted out' });
        }

        // Send messages to all targets
        const sendPromises = targets.map(targetId => 
            bot.sendMessage(targetId, message, options)
                .then(() => console.log(`[Notify] Sent to ${targetId} (Type: ${type})`))
                .catch(err => console.error(`[Notify] Failed for ${targetId}:`, err.message))
        );

        await Promise.all(sendPromises);
        res.status(200).json({ success: true, sentTo: targets.length });
    } catch (error) {
        console.error('[Notify] Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to broadcast notification' });
    }
});

console.log('[Debug] Step 9: Starting listener...');
app.listen(PORT, () => {
    console.log(`🤖 Targeted Telegram Bot Backend is running on http://localhost:${PORT}`);
    console.log(`🌐 Web App configured to open URL: ${webAppUrl}`);
});
