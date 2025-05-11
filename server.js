const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let registrations = [];

// POST endpoint for registrations
app.post('/api/registrations', (req, res) => {
  const data = req.body;
  console.log('Received:', data);
  registrations.push(data);
  res.status(200).send({ message: 'Saved' });
});

app.listen(port, () => console.log(`Running on port ${port}`));