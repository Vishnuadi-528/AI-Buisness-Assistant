'use strict';

const { buildUserPrompt, parseAIResponse } = require('../../src/services/aiService');

describe('buildUserPrompt', () => {
  it('includes businessName in the prompt', () => {
    const prompt = buildUserPrompt({ businessName: 'Chai Corner' });
    expect(prompt).toContain('Chai Corner');
  });

  it('includes investmentAmount when provided', () => {
    const prompt = buildUserPrompt({ businessName: 'Test', investmentAmount: '500000 INR' });
    expect(prompt).toContain('500000 INR');
  });

  it('labels investment as not specified when absent', () => {
    const prompt = buildUserPrompt({ businessName: 'Test' });
    expect(prompt).toContain('Not specified');
  });

  it('includes country when provided', () => {
    const prompt = buildUserPrompt({ businessName: 'Test', country: 'India' });
    expect(prompt).toContain('India');
  });

  it('filters out empty optional fields', () => {
    const prompt = buildUserPrompt({ businessName: 'Test', location: '' });
    // Empty location should not appear as a line
    expect(prompt).not.toContain('City / Region:');
  });
});

describe('parseAIResponse', () => {
  it('parses clean JSON', () => {
    const input = JSON.stringify({ report_type: 'full', executive_summary: 'Test summary' });
    const result = parseAIResponse(input);
    expect(result.report_type).toBe('full');
    expect(result.executive_summary).toBe('Test summary');
  });

  it('strips leading ```json fence', () => {
    const input = '```json\n{"report_type":"full"}\n```';
    const result = parseAIResponse(input);
    expect(result.report_type).toBe('full');
  });

  it('strips leading ``` fence without language tag', () => {
    const input = '```\n{"report_type":"clarification_needed"}\n```';
    const result = parseAIResponse(input);
    expect(result.report_type).toBe('clarification_needed');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAIResponse('not json at all')).toThrow();
  });
});
