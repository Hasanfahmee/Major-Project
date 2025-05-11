const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Registration Endpoint
app.post('/register', async (req, res) => {
  try {
    const { error } = await supabase.from('registrations').insert([req.body]);
    if (error) throw error;
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Call Scheduling (Placeholder)
app.post('/call', async (req, res) => {
  // Implement call scheduling logic (e.g., integrate with Twilio or Calendly)
  res.status(200).json({ message: 'Call scheduled successfully' });
});

// Meeting Scheduling
app.post('/schedule', async (req, res) => {
  try {
    const { error } = await supabase.from('schedules').insert([req.body]);
    if (error) throw error;
    res.status(200).json({ message: 'Meeting scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Text Message
app.post('/text', async (req, res) => {
  try {
    const { error } = await supabase.from('messages').insert([req.body]);
    if (error) throw error;
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FAQ Submission
app.post('/faq', async (req, res) => {
  try {
    const { error } = await supabase.from('faqs').insert([req.body]);
    if (error) throw error;
    res.status(200).json({ message: 'Question submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Feedback Submission
app.post('/feedback', async (req, res) => {
  try {
    const { error } = await supabase.from('feedbacks').insert([req.body]);
    if (error) throw error;
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch Feedbacks
app.get('/feedbacks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});