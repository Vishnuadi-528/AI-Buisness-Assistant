'use strict';

const logger = require('../config/logger');
const Business = require('../models/Business');
const Report = require('../models/Report');
const { generateBusinessReport } = require('../services/aiService');
const { ok, created, notFound, forbidden, serverError } = require('../utils/response');

const SECTION_KEYS = [
  'investment_analysis', 'employee_requirement', 'government_schemes',
  'bank_loan_guidance', 'risks', 'pros_and_cons', 'action_plan',
];

// ─── List businesses ──────────────────────────────────────

async function listBusinesses(req, res) {
  try {
    const businesses = await Business.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Attach report count to each entry
    const ids = businesses.map((b) => b._id);
    const counts = await Report.aggregate([
      { $match: { businessId: { $in: ids } } },
      { $group: { _id: '$businessId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const result = businesses.map((b) => ({
      ...b,
      reportCount: countMap[b._id.toString()] ?? 0,
    }));

    return ok(res, result);
  } catch (err) {
    logger.error({ err }, 'listBusinesses error');
    return serverError(res);
  }
}

// ─── Create business ──────────────────────────────────────

async function createBusiness(req, res) {
  const { businessName, industry, investmentAmount, country, location, stage } = req.body;
  try {
    const business = await Business.create({
      userId: req.user.userId,
      businessName,
      industry: industry || null,
      investmentAmount: investmentAmount ?? null,
      country: country || null,
      location: location || null,
      stage: stage ?? 'idea',
    });
    logger.info({ businessId: business._id, userId: req.user.userId }, 'Business created');
    return created(res, business, 'Business entry created.');
  } catch (err) {
    logger.error({ err }, 'createBusiness error');
    return serverError(res);
  }
}

// ─── Get single business ──────────────────────────────────

async function getBusiness(req, res) {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    const reportCount = await Report.countDocuments({ businessId: business._id });
    return ok(res, { ...business, reportCount });
  } catch (err) {
    logger.error({ err }, 'getBusiness error');
    return serverError(res);
  }
}

// ─── Update business ─────────────────────────────────────

async function updateBusiness(req, res) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    Object.assign(business, req.body);
    await business.save();
    return ok(res, business, 'Business updated.');
  } catch (err) {
    logger.error({ err }, 'updateBusiness error');
    return serverError(res);
  }
}

// ─── Delete business ──────────────────────────────────────

async function deleteBusiness(req, res) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    // Cascade delete all reports for this business
    await Report.deleteMany({ businessId: business._id });
    await business.deleteOne();
    logger.info({ businessId: req.params.id }, 'Business and reports deleted');
    return ok(res, null, 'Business deleted.');
  } catch (err) {
    logger.error({ err }, 'deleteBusiness error');
    return serverError(res);
  }
}

// ─── Generate report ──────────────────────────────────────

async function generateReport(req, res) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    const input = {
      businessName:      business.businessName,
      investmentAmount:  business.investmentAmount
        ? `${business.investmentAmount} ${business.country === 'India' ? 'INR' : 'USD'}`
        : null,
      industry:          business.industry,
      country:           business.country,
      location:          business.location,
      stage:             business.stage,
      teamSize:          req.body.teamSize ?? null,
      timeline:          req.body.timeline ?? null,
      additionalContext: req.body.additionalContext ?? null,
    };

    const { reportType, data } = await generateBusinessReport(input);

    // Return clarifying questions without persisting a report
    if (reportType === 'clarification_needed') {
      return ok(res,
        { reportType, clarifyingQuestions: data.clarifying_questions },
        'Additional information needed before report can be generated.'
      );
    }

    // Find next version number
    const latest = await Report.findOne({ businessId: business._id })
      .sort({ version: -1 })
      .select('version')
      .lean();
    const nextVersion = (latest?.version ?? 0) + 1;

    // Build embedded sections array
    const sections = SECTION_KEYS
      .filter((k) => data[k])
      .map((k) => ({ sectionKey: k, content: data[k] }));

    const report = await Report.create({
      businessId:       business._id,
      version:          nextVersion,
      reportJson:       data,
      reportMarkdown:   data.report_markdown ?? '',
      generationStatus: 'completed',
      inputSnapshot:    input,
      sections,
    });

    logger.info({ reportId: report._id, version: nextVersion, businessId: business._id }, 'Report generated');
    return created(res, report, 'Report generated successfully.');
  } catch (err) {
    logger.error({ err }, 'generateReport error');
    return serverError(res, err.message || 'Failed to generate report.');
  }
}

// ─── Clarify ─────────────────────────────────────────────

async function clarifyBusiness(req, res) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    const { answers } = req.body;
    if (answers.industry)        business.industry        = answers.industry;
    if (answers.country)         business.country         = answers.country;
    if (answers.location)        business.location        = answers.location;
    if (answers.stage)           business.stage           = answers.stage;
    if (answers.investmentAmount) {
      const parsed = parseFloat(answers.investmentAmount);
      if (!isNaN(parsed)) business.investmentAmount = parsed;
    }

    await business.save();
    return ok(res, null, 'Clarification saved. You can now call generate-report.');
  } catch (err) {
    logger.error({ err }, 'clarifyBusiness error');
    return serverError(res);
  }
}

module.exports = {
  listBusinesses, createBusiness, getBusiness,
  updateBusiness, deleteBusiness, generateReport, clarifyBusiness,
};
