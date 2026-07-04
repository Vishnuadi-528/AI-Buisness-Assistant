'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const User     = require('../models/User');
const Business = require('../models/Business');

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Upsert demo user
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const user = await User.findOneAndUpdate(
    { email: 'demo@example.com' },
    { name: 'Demo User', email: 'demo@example.com', passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Demo user: ${user.email} (${user._id})`);

  // Upsert demo business
  const biz = await Business.findOneAndUpdate(
    { userId: user._id, businessName: 'Sample Coffee Shop' },
    {
      userId: user._id,
      businessName: 'Sample Coffee Shop',
      industry: 'Food & Beverage',
      investmentAmount: 500000,
      country: 'India',
      location: 'Bangalore',
      stage: 'idea',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Demo business: ${biz.businessName} (${biz._id})`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
