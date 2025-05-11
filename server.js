const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let registrations = [];
let calls = [];
let meetings = [];
let messages = [];
let faqs = [];
let feedbacks = [];

// POST endpoints
app.post('/api/registrations', (req, res) => {
  const data = req.body;
  console.log('Received registration:', data);
  registrations.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.post('/api/calls', (req, res) => {
  const data = req.body;
  console.log('Received call:', data);
  calls.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.post('/api/meetings', (req, res) => {
  const data = req.body;
  console.log('Received meeting:', data);
  meetings.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.post('/api/messages', (req, res) => {
  const data = req.body;
  console.log('Received message:', data);
  messages.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.post('/api/faqs', (req, res) => {
  const data = req.body;
  console.log('Received FAQ:', data);
  faqs.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.post('/api/feedbacks', (req, res) => {
  const data = req.body;
  console.log('Received feedback:', data);
  feedbacks.push(data);
  res.status(200).send({ message: 'Saved' });
});

// GET endpoints
app.get('/api/registrations', (req, res) => {
  res.status(200).send(registrations);
});

app.get('/api/calls', (req, res) => {
  res.status(200).send(calls);
});

app.get('/api/meetings', (req, res) => {
  res.status(200).send(meetings);
});

app.get('/api/messages', (req, res) => {
  res.status(200).send(messages);
});

app.get('/api/faqs', (req, res) => {
  res.status(200).send(faqs);
});

app.get('/api/feedbacks', (req, res) => {
  res.status(200).send(feedbacks);
});

app.listen(port, () => console.log(`Running on port ${port}`));