'use strict';

const Joi = require('joi');

const createBusiness = Joi.object({
  businessName: Joi.string().trim().min(2).max(200).required(),
  industry: Joi.string().trim().max(100).optional().allow('', null),
  investmentAmount: Joi.number().positive().precision(2).optional().allow(null),
  country: Joi.string().trim().max(100).optional().allow('', null),
  location: Joi.string().trim().max(200).optional().allow('', null),
  stage: Joi.string().valid('idea', 'early', 'growth').default('idea'),
});

const updateBusiness = Joi.object({
  businessName: Joi.string().trim().min(2).max(200).optional(),
  industry: Joi.string().trim().max(100).optional().allow('', null),
  investmentAmount: Joi.number().positive().precision(2).optional().allow(null),
  country: Joi.string().trim().max(100).optional().allow('', null),
  location: Joi.string().trim().max(200).optional().allow('', null),
  stage: Joi.string().valid('idea', 'early', 'growth').optional(),
}).min(1);

const generateReport = Joi.object({
  teamSize: Joi.string().trim().max(100).optional().allow('', null),
  timeline: Joi.string().trim().max(200).optional().allow('', null),
  additionalContext: Joi.string().trim().max(2000).optional().allow('', null),
});

const clarify = Joi.object({
  answers: Joi.object().pattern(Joi.string(), Joi.string().allow('', null)).required(),
});

module.exports = { createBusiness, updateBusiness, generateReport, clarify };
