require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the frontend HTML file
const path = require('path');
app.use(express.static(path.resolve('C:\\Users\\Asus\\Downloads\\proj')));
app.use(express.static(path.resolve('C:\\Users\\Asus\\Downloads\\proj\\public')));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { username, full_name, email, password, phone } = req.body;
    
    const finalUsername = username || full_name;

    // Basic Backend Validation
    if (!finalUsername || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email or Phone Number already exists.' });
        }

        // Hash the password securely
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert into database
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
            [finalUsername, email, phone, passwordHash]
        );

        // Send Email Notification
        const mailOptions = {
            from: `"Naturaze App" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: '🔔 New User Registration!',
            html: `
                <h2>New User Alert</h2>
                <p>A new user has just created an account:</p>
                <ul>
                    <li><strong>Name:</strong> ${finalUsername}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
                </ul>
                <p>Log in to your MySQL database to see full details.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Failed to send email notification:', error);
            } else {
                console.log('Email notification sent:', info.response);
            }
        });

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Admin Route to view all users
app.get('/admin/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, full_name, email, phone, created_at FROM users ORDER BY created_at DESC');
        
        let html = `
            <html>
            <head>
                <title>Registered Users</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; }
                    th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Naturaze - Registered Users List</h2>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registered Date</th>
                    </tr>
        `;
        
        users.forEach(u => {
            html += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.full_name}</td>
                    <td>${u.email}</td>
                    <td>${u.phone || 'N/A'}</td>
                    <td>${new Date(u.created_at).toLocaleString()}</td>
                </tr>
            `;
        });
        
        html += `
                </table>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error while fetching users.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
