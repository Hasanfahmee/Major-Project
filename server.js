const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['https://weddingpal-api.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));
app.use(express.static(__dirname));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Ensure JSON files exist
const jsonFiles = ['users.json', 'faqs.json', 'feedbacks.json', 'messages.json'];
async function ensureJsonFiles() {
    for (const file of jsonFiles) {
        const filePath = path.join(__dirname, file);
        try {
            await fs.access(filePath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`Creating ${file}`);
                await fs.writeFile(filePath, '[]');
            } else {
                console.error(`Error accessing ${file}:`, err);
            }
        }
    }
}

// Generic function to add item to JSON file
async function addItem(fileName, newItem) {
    const filePath = path.join(__dirname, fileName);
    try {
        console.log(`Adding to ${fileName}:`, newItem);
        let items = [];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            items = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        newItem.id = items.length ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
        items.push(newItem);
        await fs.writeFile(filePath, JSON.stringify(items, null, 2));
        console.log(`Saved to ${fileName}`);
        return newItem;
    } catch (err) {
        console.error(`Error saving ${fileName}:`, err);
        throw new Error(`Failed to save: ${err.message}`);
    }
}

// Input validation
function validateUser(user) {
    if (!user.name || !/^[A-Za-z\s]{1,50}$/.test(user.name)) {
        throw new Error('Name must be letters and spaces only (max 50 characters)');
    }
    if (!user.email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(user.email)) {
        throw new Error('Invalid email address');
    }
    if (!user.mobile || !/^\d{10}$/.test(user.mobile)) {
        throw new Error('Mobile number must be exactly 10 digits');
    }
    if (!user.aboutwed || typeof user.aboutwed !== 'string') {
        throw new Error('About wedding is required');
    }
    if (!user.location || !['Indoor', 'Outdoor', 'Both'].includes(user.location)) {
        throw new Error('Invalid location');
    }
}

// API endpoints
app.get('/users', async (req, res) => {
    try {
        console.log('GET /users');
        const data = await fs.readFile('users.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('GET /users error:', err);
        res.status(500).json({ error: 'Failed to read users', details: err.message });
    }
});

app.get('/faqs', async (req, res) => {
    try {
        console.log('GET /faqs');
        const data = await fs.readFile('faqs.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('GET /faqs error:', err);
        res.status(500).json({ error: 'Failed to read FAQs', details: err.message });
    }
});

app.get('/feedbacks', async (req, res) => {
    try {
        console.log('GET /feedbacks');
        const data = await fs.readFile('feedbacks.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('GET /feedbacks error:', err);
        res.status(500).json({ error: 'Failed to read feedbacks', details: err.message });
    }
});

app.get('/messages', async (req, res) => {
    try {
        console.log('GET /messages');
        const data = await fs.readFile('messages.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('GET /messages error:', err);
        res.status(500).json({ error: 'Failed to read messages', details: err.message });
    }
});

app.post('/register', csrfProtection, async (req, res) => {
    try {
        console.log('POST /register:', req.body);
        const newUser = {
            aboutwed: req.body.aboutwed,
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            location: req.body.location
        };
        validateUser(newUser);
        const user = await addItem('users.json', newUser);
        res.json({ message: 'Registration successful', user });
    } catch (err) {
        console.error('POST /register error:', err);
        res.status(400).json({ error: 'Failed to register', details: err.message });
    }
});

app.post('/faq', csrfProtection, async (req, res) => {
    try {
        console.log('POST /faq:', req.body);
        if (!req.body.question || typeof req.body.question !== 'string') {
            throw new Error('Question is required');
        }
        const newFaq = { question: req.body.question };
        const faq = await addItem('faqs.json', newFaq);
        res.json({ message: 'FAQ submitted successfully', faq });
    } catch (err) {
        console.error('POST /faq error:', err);
        res.status(400).json({ error: 'Failed to submit FAQ', details: err.message });
    }
});

app.post('/feedback', csrfProtection, async (req, res) => {
    try {
        console.log('POST /feedback:', req.body);
        const newFeedback = {
            feedback: req.body.feedback,
            name: req.body.name,
            email: req.body.email
        };
        if (!newFeedback.feedback || typeof newFeedback.feedback !== 'string') {
            throw new Error('Feedback is required');
        }
        if (!newFeedback.name || !/^[A-Za-z\s]{1,50}$/.test(newFeedback.name)) {
            throw new Error('Name must be letters and spaces only (max 50 characters)');
        }
        if (!newFeedback.email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(newFeedback.email)) {
            throw new Error('Invalid email address');
        }
        const feedback = await addItem('feedbacks.json', newFeedback);
        res.json({ message: 'Feedback submitted successfully', feedback });
    } catch (err) {
        console.error('POST /feedback error:', err);
        res.status(400).json({ error: 'Failed to submit feedback', details: err.message });
    }
});

app.post('/text', csrfProtection, async (req, res) => {
    try {
        console.log('POST /text:', req.body);
        if (!req.body.message || typeof req.body.message !== 'string') {
            throw new Error('Message is required');
        }
        const newMessage = {
            message: req.body.message,
            timestamp: new Date().toISOString()
        };
        const message = await addItem('messages.json', newMessage);
        res.json({ message: 'Message sent successfully', message });
    } catch (err) {
        console.error('POST /text error:', err);
        res.status(400).json({ error: 'Failed to send message', details: err.message });
    }
});

app.post('/call', csrfProtection, async (req, res) => {
    try {
        console.log('POST /call');
        res.json({ message: 'Call scheduled successfully' });
    } catch (err) {
        console.error('POST /call error:', err);
        res.status(400).json({ error: 'Failed to schedule call', details: err.message });
    }
});

app.post('/schedule', csrfProtection, async (req, res) => {
    try {
        console.log('POST /schedule:', req.body);
        const scheduleData = {
            type: req.body.type,
            day: req.body.day,
            time: req.body.time,
            month: req.body.month
        };
        if (!scheduleData.type || !['online', 'offline'].includes(scheduleData.type)) {
            throw new Error('Invalid meeting type');
        }
        if (!scheduleData.day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(scheduleData.day)) {
            throw new Error('Invalid day');
        }
        if (!scheduleData.time || !['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'].includes(scheduleData.time)) {
            throw new Error('Invalid time');
        }
        if (!scheduleData.month || !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(scheduleData.month)) {
            throw new Error('Invalid month');
        }
        res.json({ message: `Meeting scheduled for ${scheduleData.day}, ${scheduleData.month} at ${scheduleData.time} (${scheduleData.type})` });
    } catch (err) {
        console.error('POST /schedule error:', err);
        res.status(400).json({ error: 'Failed to schedule meeting', details: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize JSON files and start server
(async () => {
    try {
        await ensureJsonFiles();
        console.log('JSON files ready');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();

module.exports = app;