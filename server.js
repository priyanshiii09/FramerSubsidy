
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// --- PostgreSQL Pool Setup ---
const pool = new Pool({
  user: 'postgres',
  password: 'rohitPen15',
  host: '127.0.0.1',
  port: 5432,
  database: 'farmer_subsidies'
});

// Immediately attempt to connect
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL.'))
  .catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database Logic ---
const getApplications = async () => {
  try {
    const result = await pool.query('SELECT * FROM applications ');
    return result.rows;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

const addApplication = async ({ farmer_name, contact_info, subsidy_type, details }) => {
  const query = `
    INSERT INTO applications (farmer_name, contact_info, subsidy_type, details)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [farmer_name, contact_info, subsidy_type, details];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding application:', error);
    throw error;
  }
};

// --- API Routes ---

// GET all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await getApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// POST a new application
app.post('/api/applications', async (req, res) => {
  const { farmer_name, contact_info, subsidy_type, details } = req.body;

  if (!farmer_name || !subsidy_type) {
    return res.status(400).json({ error: 'Farmer name and subsidy type are required.' });
  }

  try {
    const newApp = await addApplication({ farmer_name, contact_info, subsidy_type, details });
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
