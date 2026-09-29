const { sendError } = require('../utils/responseHandler');

const getValueByPath = (source, field) => {
  if (!field || !source) return undefined;

  const segments = field.split('.');
  let value = source;

  for (const segment of segments) {
    if (value === undefined || value === null) return undefined;
    value = value[segment];
  }

  return value;
};

const validateMiddleware = (rules) => {
  return (req, res, next) => {
    const errors = [];

    if (!rules || typeof rules !== 'object') {
      return next();
    }

    for (const [field, config] of Object.entries(rules)) {
      const source = config.source || 'body';
      const value = source === 'params'
        ? getValueByPath(req.params, field)
        : source === 'query'
          ? getValueByPath(req.query, field)
          : getValueByPath(req.body, field);

      if (config.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required.`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '' && config.type) {
        if (config.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string.`);
        }

        if (config.type === 'number' && (Number.isNaN(Number(value)) || value === '')) {
          errors.push(`${field} must be a valid number.`);
        }

        if (config.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push(`${field} must be a valid email.`);
        }

        if (config.type === 'array' && !Array.isArray(value)) {
          errors.push(`${field} must be an array.`);
        }

        if (config.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          errors.push(`${field} must be an object.`);
        }
      }

      if (config.minLength !== undefined && typeof value === 'string' && value.length < config.minLength) {
        errors.push(`${field} must be at least ${config.minLength} characters.`);
      }

      if (config.enum && value !== undefined && value !== null && !config.enum.includes(value)) {
        errors.push(`${field} must be one of: ${config.enum.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      return sendError(res, 400, 'Validation failed.', errors);
    }

    next();
  };
};

module.exports = validateMiddleware;
