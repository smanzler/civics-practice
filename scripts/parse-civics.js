import fs from "fs";

const raw = fs.readFileSync("scripts/civics.txt", "utf8");

// Normalize text
const text = raw
  .replace(/\r/g, "")
  .replace(/[•▪]/g, "-")
  .replace(/\n{2,}/g, "\n");

const lines = text.split("\n").map((l) => l.trim());

const results = [];

let current = null;
let currentSection = null;
let currentSubsection = null;

// ---- helpers ----

function detectMinAnswers(question) {
  const match = question.match(/name (\w+)/i);
  if (!match) return null;

  const map = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  return map[match[1].toLowerCase()] || null;
}

function isCurrentInfoQuestion(question) {
  return /\bnow\?/i.test(question);
}

// ---- parsing ----

for (const line of lines) {
  if (!line) continue;

  // Section header (e.g. "AMERICAN HISTORY")
  if (/^[A-Z\s]+$/.test(line) && line.length > 3) {
    currentSection = line;
    currentSubsection = null;
    continue;
  }

  // Subsection header (e.g. "A: Principles of American Government")
  const subsectionMatch = line.match(/^[A-Z]:\s+(.*)$/);
  if (subsectionMatch) {
    currentSubsection = subsectionMatch[1];
    continue;
  }

  // Question line
  const qMatch = line.match(/^(\d+)\.\s+(.*)$/);
  if (qMatch) {
    if (current) results.push(current);

    const id = Number(qMatch[1]);
    let questionText = qMatch[2].trim();

    const starred = questionText.endsWith("*");
    questionText = questionText.replace(/\s*\*$/, "");

    current = {
      id,
      question: questionText,
      section: currentSection,
      subsection: currentSubsection,
      acceptableAnswers: [],
    };

    if (starred) current.starred = true;

    const min = detectMinAnswers(questionText);
    if (min && min > 1) {
      current.minAnswersRequired = min;
    }

    if (isCurrentInfoQuestion(questionText)) {
      current.requiresCurrentInfo = true;
    }

    continue;
  }

  // Answer line
  if (current && line.startsWith("-")) {
    const answer = line.replace(/^-\s*/, "").trim();

    if (/answers will vary/i.test(answer)) {
      current.variable = true;
      continue;
    }

    current.acceptableAnswers.push(answer);
  }
}

// Push final question
if (current) results.push(current);

// Cleanup
const cleaned = results.map((q) => {
  if (q.acceptableAnswers.length === 0) {
    delete q.acceptableAnswers;
  }
  if (!q.subsection) delete q.subsection;
  return q;
});

// Write output
fs.writeFileSync("lib/civics.json", JSON.stringify(cleaned, null, 2));

console.log(`Parsed ${cleaned.length} questions → civics.json`);
