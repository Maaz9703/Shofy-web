/**
 * Seed admin user - run: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seedAdmin.js
 * Creates the admin user if it does not exist. Never commit real credentials.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters) in the environment.');
    process.exit(1);
  }
  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists');
      process.exit(0);
      return;
    }
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing user to admin');
    process.exit(0);
    return;
  }
  await User.create({
    name: 'Trader Admin',
    email,
    password,
    role: 'admin',
  });
  console.log(`Admin user created: ${email}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
