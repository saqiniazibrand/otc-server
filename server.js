const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json())

const PASSWORDS_FILE = path.join(__dirname, 'passwords.json');

// Helper to read passwords (plain text)
function getPasswords() {
  const data = fs.readFileSync(PASSWORDS_FILE, 'utf-8');
  return JSON.parse(data).passwords; // array of plain text passwords
}

// Helper to write passwords
function setPasswords(passwords) {
  fs.writeFileSync(PASSWORDS_FILE, JSON.stringify({ passwords }, null, 2));
}



app.post('/send-payment-email', async (req, res) => {
  try {
    const { paymentMethod, walletAddress } = req.body;
    
    // Configure your email transport (use your real credentials)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ztsteam000@gmail.com', // replace with your Gmail
        pass: 'aukb injr sozb laul' // replace with your Gmail App Password
      }
    });

    let mailOptions = {
      from: 'ztsteam000@gmail.com', // sender address
      to: 'fatimahamid711@gmail.com', // receiver
      subject: 'Payment Confirmation',
      text: `Payment received via ${paymentMethod}. Wallet address: ${walletAddress}. Please verify the payment and activate the software.`,
      html: `
        <h2>Payment Confirmation</h2>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Wallet Address:</strong> ${walletAddress}</p>
        <p>Please verify the payment and activate the software for the user.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Validate password endpoint (plain text)
app.post('/validate-password', (req, res) => {
  const { password } = req.body;
  const passwords = getPasswords();
  const valid = passwords.includes(password);
  res.json({ valid });
});

// Admin: Get all passwords
app.get('/admin/passwords', (req, res) => {
  res.json({ passwords: getPasswords() });
});

// Admin: Add password (plain text)
app.post('/admin/passwords', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password required' });
  }
  const passwords = getPasswords();
  if (passwords.includes(password)) {
    return res.status(409).json({ message: 'Password already exists' });
  }
  passwords.push(password);
  setPasswords(passwords);
  res.json({ passwords });
});

// Admin: Update password (plain text)
app.put('/admin/passwords', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  let passwords = getPasswords();
  const idx = passwords.indexOf(oldPassword);
  if (idx === -1) {
    return res.status(404).json({ message: 'Old password not found' });
  }
  passwords[idx] = newPassword;
  setPasswords(passwords);
  res.json({ passwords });
});

// Admin: Delete password (plain text)
app.delete('/admin/passwords', (req, res) => {
  const { password } = req.body;
  let passwords = getPasswords();
  const initialLength = passwords.length;
  passwords = passwords.filter(p => p !== password);
  setPasswords(passwords);
  res.json({ passwords });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});