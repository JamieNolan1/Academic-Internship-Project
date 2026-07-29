const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// ==================== DATABASE CONNECTION ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ==================== AUTHENTICATION MIDDLEWARE ====================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// ==================== AUTH ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
            [username, email, hashedPassword]
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Username or email already exists.' });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
});

// LOGIN (with debug)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Password received:', password ? 'Yes' : 'No');
    
    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ error: 'Username and password required.' });
    }
    
    try {
        console.log('Querying database for user...');
        const result = await pool.query(
            'SELECT user_id, username, password_hash FROM users WHERE username = $1',
            [username]
        );
        
        console.log('User found:', result.rows.length > 0 ? 'Yes' : 'No');
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        
        const user = result.rows[0];
        console.log('Comparing password...');
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        console.log('Password valid:', validPassword ? 'Yes' : 'No');
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        
        console.log('Generating token...');
        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('Login successful!');
        res.json({
            success: true,
            token: token,
            userId: user.user_id,
            username: user.username
        });
    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            error: 'Internal server error.',
            details: error.message
        });
    }
});

// ==================== LOSS CALCULATION ROUTES (Protected) ====================

// GET all products (filtered by user)
app.get('/api/loss', authenticateToken, async (req, res) => {
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            'SELECT * FROM loss_calculation WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data.' });
    }
});

// GET entries for the current user
app.get('/api/loss/entries', authenticateToken, async (req, res) => {
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            'SELECT * FROM loss_calculation WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
});

// GET single product 
app.get('/api/loss/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            'SELECT * FROM loss_calculation WHERE id = $1 AND user_id = $2',
            [id, req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
});

// ADD new product (update with cost_per_unit)
app.post('/api/loss', authenticateToken, async (req, res) => {
    const { productName, price, costPerUnit, amountStocked, amountSold, amountStolen } = req.body;
    
    if (!productName || price === undefined || amountStocked === undefined) {
        return res.status(400).json({ error: 'Product name, price, and amount stocked are required.' });
    }
    
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            `INSERT INTO loss_calculation 
             (user_id, product_name, price, cost_per_unit, amount_stocked, amount_sold, amount_stolen)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [req.user.userId, productName, price, costPerUnit || 0, amountStocked || 0, amountSold || 0, amountStolen || 0]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding product:', error);
        if (error.code === '23514') {
            res.status(400).json({ error: 'Invalid inventory. Sold + stolen cannot exceed stocked.' });
        } else {
            res.status(500).json({ error: 'Failed to add product.' });
        }
    }
});
// DELETE product 
app.delete('/api/loss/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            'DELETE FROM loss_calculation WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or access denied.' });
        }
        
        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product.' });
    }
});

// GET summary stats 
app.get('/api/loss/summary', authenticateToken, async (req, res) => {
    try {
        await pool.query('SELECT set_current_user($1)', [req.user.userId]);
        
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(total_sales), 0) as total_revenue,
                COALESCE(SUM(total_loss), 0) as total_loss,
                COALESCE(AVG(loss_percentage), 0) as avg_loss_percentage
             FROM loss_calculation
             WHERE user_id = $1`,
            [req.user.userId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary.' });
    }
});

// start server
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` API endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/loss`);
    console.log(`   GET    /api/loss/:id`);
    console.log(`   POST   /api/loss`);
    console.log(`   PUT    /api/loss/:id`);
    console.log(`   DELETE /api/loss/:id`);
    console.log(`   GET    /api/loss/summary`);
});