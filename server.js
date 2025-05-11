require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Example route
app.post('/api/registrations', async (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  const { error } = await supabase.from('registrations').insert([data]);
  if (error) {
    console.error('Error inserting data:', error);
    res.status(500).send({ message: 'Error inserting data' });
  } else {
    res.status(200).send({ message: 'Data received successfully' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
