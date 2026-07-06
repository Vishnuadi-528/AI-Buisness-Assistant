'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true, maxlength: 100 },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before save if provided as plaintext via .password virtual
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never expose passwordHash in JSON responses
userSchema.set('toJSON', {
  transform(_, obj) {
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  },
});

module.exports = mongoose.model('User', userSchema);
