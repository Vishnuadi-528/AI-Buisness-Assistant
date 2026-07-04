'use strict';

const { badRequest } = require('../utils/response');

/**
 * Factory — returns an Express middleware that validates req.body against a Joi schema.
 * On failure, responds 400 with a structured errors array.
 * On success, replaces req.body with the Joi-coerced value (trimmed, defaulted, etc.)
 *
 * @param {import('joi').Schema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key ?? 'unknown',
        message: d.message,
      }));
      return badRequest(res, 'Validation failed.', errors);
    }

    req.body = value;
    next();
  };
}

module.exports = { validate };
