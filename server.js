const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  password: 'rohitPen15',
  host: '127.0.0.1',
  port: 5432,
  database: 'farmer_subsidies'
});

// Confirm PostgreSQL connection on startup
pool.connect()
  .then(client => {
    console.log(' PostgreSQL connected successfully!');
    client.release(); // release client back to pool
  })
  .catch(err => {
    console.error(' PostgreSQL connection failed:', err);
    process.exit(1);
  });


// 1️⃣ Get all farmers
app.get('/api/farmers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM farmer');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// 2️⃣ Register new farmer
app.post('/api/farmers', async (req, res) => {
  const { name, contact_number, bank_account, farmer_id, aadhar_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO farmer (name, contact_number, bank_account, farmer_id, aadhar_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, contact_number, bank_account, farmer_id, aadhar_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(' Failed to register farmer:', err);
    res.status(500).json({ error: 'Failed to register farmer' });
  }
});


// 3️⃣ Submit new application
app.post('/api/applications', async (req, res) => {
  const { farmer_id, application_id, submission_date } = req.body;

  // Set the default status to 'Pending' if not provided
  const status = 'Pending';

  try {
    const result = await pool.query(
      'INSERT INTO application (farmer_id, application_id, submission_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [farmer_id, application_id, submission_date, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 4️⃣ Get all subsidies
app.get('/api/subsidies', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subsidy');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subsidies' });
  }
});

// 5️⃣ Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM document');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});
// 6️⃣ Upload new document
app.post('/api/documents', async (req, res) => {
  const { document_id, document_type, application_type, farmer_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO document (document_id, document_type, application_type, farmer_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [document_id, document_type, application_type, farmer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err); // helpful during debugging
    res.status(500).json({ error: 'Failed to upload document' });
  }
});



// 7️⃣ Make a payment
app.post('/api/payments', async (req, res) => {
  const { payment_id, amount_paid, farmer_id, payment_date, payment_status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payments (payment_id, amount_paid, farmer_id, payment_date, payment_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [payment_id, amount_paid, farmer_id, payment_date, payment_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// 8️⃣ Get administrators
app.get('/api/admins', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM administrator');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// 9️⃣ Register administrator
app.post('/api/admins', async (req, res) => {
  const { admin_name, admin_id, email, role, contact_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO administrator (admin_name, admin_id, email, role, contact_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [admin_name, admin_id, email, role, contact_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register admin' });
  }
});
const getAllApplications = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM application');
    res.status(200).json(result.rows);  // Return all the applications as JSON
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
};
// Route: /api/farmer-dashboard/:farmerId
app.get('/api/farmer-dashboard/:farmerId', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const farmerQuery = await pool.query('SELECT * FROM farmer WHERE farmer_id = $1', [farmerId]);
    const appsQuery = await pool.query('SELECT * FROM application WHERE farmer_id = $1', [farmerId]);

    if (farmerQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      farmer: farmerQuery.rows[0],
      applications: appsQuery.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});




app.get('/api/applications', getAllApplications);

app.post('/api/signin', async (req, res) => {
  const { email } = req.body; 
  try {
   
    const result = await pool.query('SELECT * FROM administrator WHERE email = $1', [email]);

    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Admin not found' });
    }

    const admin = result.rows[0];

   
    res.status(200).json({
      message: 'Admin signed in successfully',
      admin: {
        id: admin.admin_id,
        name: admin.admin_name,
        email: admin.email,
        role: admin.role,
        contact_number: admin.contact_number,
      },
    });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/register', async (req, res) => {
  const { admin_id, admin_name, email, role, contact_number } = req.body;

  try {
    // Insert into the database
    const result = await pool.query(
      'INSERT INTO administrator (admin_id, admin_name, email, role, contact_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [admin_id, admin_name, email, role, contact_number]
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: result.rows[0],
    });
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin-dashboard', async (req, res) => {
  try {
    // Fetching all applications
    const applications = await pool.query('SELECT * FROM application');
    
    // Fetching all farmers
    const farmers = await pool.query('SELECT * FROM farmer');
    
    // Fetching all admins
    const admins = await pool.query('SELECT * FROM administrator');
    
    // Fetching all payments
    const payments = await pool.query('SELECT * FROM payments');
    
    res.status(200).json({
      applications: applications.rows,
      farmers: farmers.rows,
      admins: admins.rows,
      payments: payments.rows,
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
