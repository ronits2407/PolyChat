const keywordMap = {
  gemini: [
    "who is",
    "what is",
    "define",
    "short answer",
    "summarize",
    "list",
    "price",
    "date",
  ],
  chatgpt: [
    "explain",
    "step by step",
    "why",
    "story",
    "creative",
    "design",
    "solve",
    "debug",
  ],
  claude: [
    "summarize this document",
    "analyze",
    "long essay",
    "research paper",
    "context",
    "report",
    "review",
  ],
  gemma: ["translate", "define", "what is", "convert", "today", "simple"],

  mistral: ["json", "code", "extract", "logic", "refactor", "parse"],
};

module.exports = keywordMap;
