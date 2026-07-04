'use strict';

const Groq = require('groq-sdk');
const env = require('../config/env');
const logger = require('../config/logger');
const { MASTER_SYSTEM_PROMPT } = require('../config/masterPrompt');

// Initialise Groq client
const client = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * SECTION KEYS that must appear in a full report.
 */
const REQUIRED_SECTIONS = [
  'executive_summary',
  'investment_analysis',
  'employee_requirement',
  'government_schemes',
  'bank_loan_guidance',
  'risks',
  'pros_and_cons',
  'action_plan',
  'next_steps',
  'report_markdown',
];

/**
 * Build the user-facing prompt from the business input object.
 * @param {object} input
 * @returns {string}
 */
function buildUserPrompt(input) {
  const {
    businessName,
    investmentAmount,
    industry,
    country,
    location,
    stage,
    teamSize,
    timeline,
    additionalContext,
  } = input;

  const lines = [
    `Business Name: ${businessName}`,
    investmentAmount ? `Investment Amount Available: ${investmentAmount}` : 'Investment Amount: Not specified',
    industry         ? `Industry / Sector: ${industry}`                   : 'Industry: Not specified',
    country          ? `Country / Market: ${country}`                     : 'Country: Not specified',
    location         ? `City / Region: ${location}`                       : '',
    stage            ? `Business Stage: ${stage}`                         : '',
    teamSize         ? `Current Team Size: ${teamSize}`                   : '',
    timeline         ? `Target Launch / Growth Timeline: ${timeline}`     : '',
    additionalContext ? `Additional Context: ${additionalContext}`         : '',
  ].filter(Boolean);

  return (
    `Please generate a complete Business Master Report for the following business:\n\n` +
    lines.join('\n') +
    `\n\nReturn your response as a single valid JSON object matching the schema specified in your instructions. ` +
    `Do NOT wrap the JSON in markdown code fences. If any critical information is missing to produce a ` +
    `meaningful report, return the clarification_needed format instead.`
  );
}

/**
 * Parse the raw text response from the LLM into a JS object.
 * Strips accidental markdown fences if the model adds them.
 * @param {string} rawText
 * @returns {object}
 */
function parseAIResponse(rawText) {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  return JSON.parse(cleaned);
}

/**
 * Validate that a full report contains all required top-level sections.
 * @param {object} parsed
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateFullReport(parsed) {
  const missing = REQUIRED_SECTIONS.filter((k) => !(k in parsed));
  return { valid: missing.length === 0, missing };
}

/**
 * Core function — calls Groq and returns a parsed report object.
 *
 * @param {object} input
 * @param {string}  input.businessName        - Required
 * @param {string}  [input.investmentAmount]  - e.g. "500000 INR"
 * @param {string}  [input.industry]          - e.g. "Food & Beverage"
 * @param {string}  [input.country]           - e.g. "India"
 * @param {string}  [input.location]          - e.g. "Bangalore"
 * @param {string}  [input.stage]             - idea | early | growth
 * @param {string}  [input.teamSize]          - e.g. "2 founders"
 * @param {string}  [input.timeline]          - e.g. "Launch in 6 months"
 * @param {string}  [input.additionalContext] - free text
 *
 * @returns {Promise<{ reportType: string, data: object, rawText: string }>}
 */
async function generateBusinessReport(input) {
  if (!input?.businessName?.trim()) {
    throw new Error('businessName is required to generate a report.');
  }

  const userPrompt = buildUserPrompt(input);

  logger.info(
    { businessName: input.businessName, model: env.GROQ_MODEL },
    'AI report generation started'
  );

  const startTime = Date.now();

  let completion;
  try {
    // Groq uses the OpenAI-compatible chat completions API
    completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      max_tokens: env.AI_MAX_TOKENS,
      temperature: 0.7,
      messages: [
        { role: 'system', content: MASTER_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
    });
  } catch (err) {
    logger.error({ err, businessName: input.businessName }, 'Groq API call failed');
    throw new Error(`AI service unavailable: ${err.message}`);
  }

  const durationMs = Date.now() - startTime;
  const rawText = completion.choices?.[0]?.message?.content ?? '';

  logger.info(
    {
      businessName: input.businessName,
      durationMs,
      promptTokens:     completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      finishReason:     completion.choices?.[0]?.finish_reason,
    },
    'AI report generation completed'
  );

  if (!rawText) {
    throw new Error('AI returned an empty response.');
  }

  let parsed;
  try {
    parsed = parseAIResponse(rawText);
  } catch (err) {
    logger.error({ err, rawText: rawText.slice(0, 500) }, 'Failed to parse AI JSON response');
    throw new Error('AI returned malformed JSON. Please try regenerating.');
  }

  const reportType = parsed.report_type ?? 'unknown';

  if (reportType === 'full') {
    const { valid, missing } = validateFullReport(parsed);
    if (!valid) {
      logger.warn({ missing }, 'AI full report is missing required sections');
      parsed._warnings = `Missing sections: ${missing.join(', ')}`;
    }
  }

  return { reportType, data: parsed, rawText };
}

module.exports = { generateBusinessReport, buildUserPrompt, parseAIResponse };
