const sensitiveValuePattern = /(?:SECRET|PASS(?:WORD)?|TOKEN|PRIVATE_KEY|API_KEY|CLOUDINARY_URL|(?:DATABASE|MYSQL)_(?:URL|URI)|CONNECTION_STRING)/i;

const getSafeErrorMessage = (message) => {
  let safeMessage = String(message || 'Unknown error');
  const secretValues = Object.entries(process.env)
    .filter(([name, value]) => sensitiveValuePattern.test(name) && value)
    .map(([, value]) => value)
    .sort((left, right) => right.length - left.length);

  for (const value of secretValues) {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const valuePattern = new RegExp(`(?<![A-Za-z0-9])${escapedValue}(?![A-Za-z0-9])`, 'g');
    safeMessage = safeMessage.replace(valuePattern, '[REDACTED]');
  }

  return safeMessage.slice(0, 500);
};

module.exports = getSafeErrorMessage;