const formatGeneric = (code, config) => {
  // Generic formatting for unknown languages
  const lines = code.split('\n');
  return lines
    .map(line => line.trim())
    .filter(line => line)
    .map(line => config.indent + line)
    .join('\n');
};

module.exports = formatGeneric;
