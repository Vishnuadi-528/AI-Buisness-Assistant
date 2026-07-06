'use strict';

const mongoose = require('mongoose');

// ── Sub-schema for individual named sections ──────────────
const reportSectionSchema = new mongoose.Schema(
  {
    sectionKey: { type: String, required: true }, // e.g. "investment_analysis"
    content:    { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

// ── Main report schema ────────────────────────────────────
const reportSchema = new mongoose.Schema(
  {
    businessId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    version:          { type: Number, required: true, default: 1 },
    reportJson:       { type: mongoose.Schema.Types.Mixed, required: true },  // full structured AI output
    reportMarkdown:   { type: String, default: '' },                          // rendered full report
    generationStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    inputSnapshot:    { type: mongoose.Schema.Types.Mixed, default: null },   // inputs used for this version
    sections:         [reportSectionSchema],                                  // granular section cache
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform(_, obj) { delete obj.__v; return obj; } },
  }
);

// Compound index — fast lookup of latest version for a business
reportSchema.index({ businessId: 1, version: -1 });

module.exports = mongoose.model('Report', reportSchema);
