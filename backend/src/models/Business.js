'use strict';

const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName:     { type: String, required: true, trim: true, maxlength: 200 },
    industry:         { type: String, trim: true, maxlength: 100, default: null },
    investmentAmount: { type: Number, default: null },
    country:          { type: String, trim: true, maxlength: 100, default: null },
    location:         { type: String, trim: true, maxlength: 200, default: null },
    stage:            { type: String, enum: ['idea', 'early', 'growth'], default: 'idea' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform(_, obj) { delete obj.__v; return obj; } },
  }
);

// Virtual: count of reports (populated on demand)
businessSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'businessId',
});

module.exports = mongoose.model('Business', businessSchema);
