const OpenAI = require('openai');

const aiClient = new OpenAI({
  baseUrl: "http://localhost:11434",
});

exports.aiClient = aiClient;