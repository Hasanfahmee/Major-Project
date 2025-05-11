const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for frontend
app.use(cors({ origin: 'https://weddingpal.onrender.com' }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Mock API endpoints
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: 'mock-csrf-token' });
});
app.post('/register', (req, res) => {
    res.json({ message: 'Registration successful' });
});
app.post('/call', (req, res) => {
    res.json({ message: 'Call scheduled' });
});
app.post('/schedule', (req, res) => {
    res.json({ message: 'Meeting scheduled' });
});
app.post('/text', (req, res) => {
    res.json({ message: 'Message sent' });
});
app.post('/faq', (req, res) => {
    res.json({ message: 'Question submitted' });
});
app.post('/feedback', (req, res) => {
    res.json({ message: 'Feedback submitted' });
});
app.get('/feedbacks', (req, res) => {
    res.json([
        { name: 'John', email: 'john@example.com', feedback: 'Great service!' }
    ]);
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});