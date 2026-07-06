'use strict';

const logger = require('../config/logger');
const Business = require('../models/Business');
const Report = require('../models/Report');
const { generateBusinessReport } = require('../services/aiService');
const { exportToPdf, exportToDocx } = require('../services/exportService');
const { ok, created, badRequest, notFound, forbidden, serverError } = require('../utils/response');

const SECTION_KEYS = [
  'investment_analysis', 'employee_requirement', 'government_schemes',
  'bank_loan_guidance', 'risks', 'pros_and_cons', 'action_plan',
];

// ─── List all report versions for a business ─────────────

async function listReports(req, res) {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return notFound(res, 'Business not found.');
    if (business.userId.toString() !== req.user.userId) return forbidden(res);

    const reports = await Report.find({ businessId: req.params.id })
      .sort({ version: -1 })
      .select('_id version generationStatus createdAt inputSnapshot')
      .lean();

    return ok(res, reports);
  } catch (err) {
    logger.error({ err }, 'listReports error');
    return serverError(res);
  }
}

// ─── Get single report ────────────────────────────────────

async function getReport(req, res) {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('businessId', 'userId businessName')
      .lean();
    if (!report) return notFound(res, 'Report not found.');
    if (report.businessId.userId.toString() !== req.user.userId) return forbidden(res);

    return ok(res, report);
  } catch (err) {
    logger.error({ err }, 'getReport error');
    return serverError(res);
  }
}

// ─── Get a specific section ───────────────────────────────

async function getReportSection(req, res) {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('businessId', 'userId')
      .lean();
    if (!report) return notFound(res, 'Report not found.');
    if (report.businessId.userId.toString() !== req.user.userId) return forbidden(res);

    const section = report.sections?.find((s) => s.sectionKey === req.params.sectionKey);
    if (!section) return notFound(res, `Section '${req.params.sectionKey}' not found.`);

    return ok(res, section);
  } catch (err) {
    logger.error({ err }, 'getReportSection error');
    return serverError(res);
  }
}

// ─── Regenerate report ────────────────────────────────────

async function regenerateReport(req, res) {
  try {
    const existing = await Report.findById(req.params.reportId)
      .populate('businessId')
      .lean();
    if (!existing) return notFound(res, 'Report not found.');
    if (existing.businessId.userId.toString() !== req.user.userId) return forbidden(res);

    const biz = existing.businessId;

    const input = {
      businessName:      req.body.businessName     ?? biz.businessName,
      investmentAmount:  req.body.investmentAmount
        ? `${req.body.investmentAmount} ${biz.country === 'India' ? 'INR' : 'USD'}`
        : biz.investmentAmount
          ? `${biz.investmentAmount} ${biz.country === 'India' ? 'INR' : 'USD'}`
          : null,
      industry:          req.body.industry         ?? biz.industry,
      country:           req.body.country          ?? biz.country,
      location:          req.body.location         ?? biz.location,
      stage:             req.body.stage            ?? biz.stage,
      teamSize:          req.body.teamSize         ?? null,
      timeline:          req.body.timeline         ?? null,
      additionalContext: req.body.additionalContext ?? null,
    };

    const { reportType, data } = await generateBusinessReport(input);

    if (reportType === 'clarification_needed') {
      return ok(res,
        { reportType, clarifyingQuestions: data.clarifying_questions },
        'Additional information needed before report can be regenerated.'
      );
    }

    const sections = SECTION_KEYS
      .filter((k) => data[k])
      .map((k) => ({ sectionKey: k, content: data[k] }));

    const report = await Report.create({
      businessId:       biz._id,
      version:          existing.version + 1,
      reportJson:       data,
      reportMarkdown:   data.report_markdown ?? '',
      generationStatus: 'completed',
      inputSnapshot:    input,
      sections,
    });

    logger.info({ reportId: report._id, version: report.version }, 'Report regenerated');
    return created(res, report, 'Report regenerated successfully.');
  } catch (err) {
    logger.error({ err }, 'regenerateReport error');
    return serverError(res, err.message || 'Failed to regenerate report.');
  }
}

// ─── Export report ────────────────────────────────────────

async function exportReport(req, res) {
  const format = (req.query.format ?? 'pdf').toLowerCase();
  if (!['pdf', 'docx'].includes(format)) {
    return badRequest(res, 'Invalid format. Use ?format=pdf or ?format=docx');
  }

  try {
    const report = await Report.findById(req.params.reportId)
      .populate('businessId', 'userId businessName')
      .lean();
    if (!report) return notFound(res, 'Report not found.');
    if (report.businessId.userId.toString() !== req.user.userId) return forbidden(res);

    const filename = `${report.businessId.businessName.replace(/\s+/g, '_')}_v${report.version}`;

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      await exportToPdf(report, res);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
      const buffer = await exportToDocx(report);
      res.send(buffer);
    }
  } catch (err) {
    logger.error({ err }, 'exportReport error');
    return serverError(res, 'Export failed. Please try again.');
  }
}

module.exports = { listReports, getReport, getReportSection, regenerateReport, exportReport };
