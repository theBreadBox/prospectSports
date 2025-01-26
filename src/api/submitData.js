import express from 'express';
import { Pool } from 'pg';

const router = express.Router();
const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-tiny-brook-a8s12057-pooler.eastus2.azure.neon.tech',
  database: 'neondb',
  password: 'npg_z0aGQALYM5Tt',
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // Ensure SSL is used
  },
});

router.post('/submitWalletData', async (req, res) => {
  const { address } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO presaleList (address) VALUES ($1) RETURNING *',
      [address]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting wallet data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;