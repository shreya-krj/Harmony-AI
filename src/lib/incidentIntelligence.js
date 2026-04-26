const INCIDENT_DATASET = [
  { incident_text: 'Street fight in progress near market road', category: 'Violence Risk', priority: 'High', department: 'Police' },
  { incident_text: 'Two men punching each other outside bus stand', category: 'Violence Risk', priority: 'High', department: 'Police' },
  { incident_text: 'Group threatening pedestrians near station', category: 'Violence Risk', priority: 'High', department: 'Police' },
  { incident_text: 'Person carrying knife aggressively in public', category: 'Weapon Threat', priority: 'High', department: 'Police' },
  { incident_text: 'Man threatening shopkeeper with sharp object', category: 'Weapon Threat', priority: 'High', department: 'Police' },
  { incident_text: 'Physical assault reported near ATM', category: 'Violence Risk', priority: 'High', department: 'Police' },
  { incident_text: 'Mob damaging public property', category: 'Public Disorder', priority: 'High', department: 'Police' },
  { incident_text: 'Crowd becoming violent after argument', category: 'Public Disorder', priority: 'High', department: 'Police' },
  { incident_text: 'Drunk person attacking passersby', category: 'Public Disorder', priority: 'High', department: 'Police' },
  { incident_text: 'Neighbour threatening residents loudly', category: 'Domestic Conflict', priority: 'Moderate', department: 'Police' },
  { incident_text: 'Repeated violent shouting from apartment', category: 'Domestic Conflict', priority: 'High', department: 'Police' },
  { incident_text: 'Suspicious unattended bag near office gate', category: 'Suspicious Threat', priority: 'High', department: 'Police' },
  { incident_text: 'Anonymous bomb threat call to mall', category: 'Threat Communication', priority: 'High', department: 'Police' },
  { incident_text: 'Threatening person outside school gate', category: 'Threat Communication', priority: 'High', department: 'Police' },
  { incident_text: 'Weapons seen during street argument', category: 'Weapon Threat', priority: 'High', department: 'Police' },
  { incident_text: 'Woman being harassed near bus stop', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Girl being followed near metro station', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Man making inappropriate comments at park', category: 'Harassment', priority: 'Moderate', department: 'Women Safety Cell' },
  { incident_text: 'Woman stalked repeatedly in market', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Unwanted touching reported in crowd', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Woman feeling unsafe near taxi stand', category: 'Harassment', priority: 'Moderate', department: 'Women Safety Cell' },
  { incident_text: 'Eve teasing outside college gate', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Woman threatened by stranger on road', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Workplace harassment complaint by woman', category: 'Harassment', priority: 'Moderate', department: 'Women Safety Cell' },
  { incident_text: 'Suspicious person following women at night', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Verbal abuse targeting woman in street', category: 'Harassment', priority: 'Moderate', department: 'Women Safety Cell' },
  { incident_text: 'Harassment in public transport', category: 'Harassment', priority: 'High', department: 'Women Safety Cell' },
  { incident_text: 'Unsafe group loitering near girls hostel', category: 'Harassment', priority: 'Moderate', department: 'Women Safety Cell' },
  { incident_text: 'Garbage pile causing foul smell', category: 'Sanitation', priority: 'Low', department: 'Municipal Corporation' },
  { incident_text: 'Open manhole on main road', category: 'Infrastructure Safety', priority: 'High', department: 'Municipal Corporation' },
  { incident_text: 'Streetlight not working in dark lane', category: 'Infrastructure Safety', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Broken footpath causing accidents', category: 'Infrastructure Safety', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Water leakage flooding street', category: 'Infrastructure Safety', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Drain overflow near apartments', category: 'Sanitation', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Illegal dumping of waste in park', category: 'Sanitation', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Public toilet in unusable condition', category: 'Sanitation', priority: 'Low', department: 'Municipal Corporation' },
  { incident_text: 'Broken road causing vehicle falls', category: 'Infrastructure Safety', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Tree branch blocking road', category: 'Infrastructure Safety', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Dead animal lying near road', category: 'Sanitation', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Street garbage not collected for days', category: 'Sanitation', priority: 'Low', department: 'Municipal Corporation' },
  { incident_text: 'Hate graffiti on public wall', category: 'Hate Conflict', priority: 'Moderate', department: 'Municipal Corporation' },
  { incident_text: 'Traffic signal not working at junction', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Major traffic jam due to accident', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Vehicle blocking ambulance route', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Road rage fight causing blockage', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Wrong side driving causing danger', category: 'Traffic Hazard', priority: 'Moderate', department: 'Traffic Police' },
  { incident_text: 'Illegal parking blocking school gate', category: 'Traffic Hazard', priority: 'Moderate', department: 'Traffic Police' },
  { incident_text: 'Overspeeding vehicles near school', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Truck stuck blocking flyover', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Pedestrian crossing ignored by vehicles', category: 'Traffic Hazard', priority: 'Moderate', department: 'Traffic Police' },
  { incident_text: 'Signal jumping repeatedly at crossing', category: 'Traffic Hazard', priority: 'Moderate', department: 'Traffic Police' },
  { incident_text: 'Bus parked dangerously on curve', category: 'Traffic Hazard', priority: 'Moderate', department: 'Traffic Police' },
  { incident_text: 'Reckless bike stunt on busy road', category: 'Traffic Hazard', priority: 'High', department: 'Traffic Police' },
  { incident_text: 'Fire seen in market building', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Smoke coming from apartment floor', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Gas leak smell in restaurant', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Electrical sparks from transformer', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Small fire in roadside stall', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Short circuit smell in office', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Cylinder leak reported in house', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Warehouse smoke detected', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Burning garbage spreading flames', category: 'Fire Hazard', priority: 'Moderate', department: 'Fire Department' },
  { incident_text: 'Fire alarm active in mall', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Kitchen fire in hostel mess', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Petrol smell with smoke near garage', category: 'Fire Hazard', priority: 'High', department: 'Fire Department' },
  { incident_text: 'Threatening email sent to company', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Bomb threat email received by school', category: 'Cyber Threat', priority: 'High', department: 'Cyber Cell' },
  { incident_text: 'Blackmail messages sent online', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Cyber bullying in student group', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Fake rumor causing panic online', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Account hacked with threats', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Morphed images used for harassment', category: 'Cyber Threat', priority: 'High', department: 'Cyber Cell' },
  { incident_text: 'Anonymous threats on social media', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Phishing email targeting employees', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Online extortion demand received', category: 'Cyber Threat', priority: 'High', department: 'Cyber Cell' },
  { incident_text: 'Threatening WhatsApp messages', category: 'Cyber Threat', priority: 'Moderate', department: 'Cyber Cell' },
  { incident_text: 'Leaked private data used for blackmail', category: 'Cyber Threat', priority: 'High', department: 'Cyber Cell' },
  { incident_text: 'Child crying alone at bus stop', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Lost child wandering in market', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Child labor suspected in workshop', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Minor begging under coercion', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Child locked alone at home', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Student reporting physical abuse at home', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Unsafe adult approaching school children', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Child injured and unattended in park', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Minor seen working late night stall', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Children fighting without supervision near road', category: 'Child Safety', priority: 'Moderate', department: 'Child Protection' },
  { incident_text: 'Suspicious van near school children', category: 'Child Safety', priority: 'High', department: 'Child Protection' },
  { incident_text: 'Person collapsed on street', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Individual threatening self-harm on bridge', category: 'Mental Health Risk', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Road accident victim unconscious', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Elderly person fainted in market', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Person bleeding after fall', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Severe panic crowd situation', category: 'Emergency Risk', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Unresponsive person at bus stand', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Distressed person causing unsafe scene', category: 'Mental Health Risk', priority: 'Moderate', department: 'Emergency Response' },
  { incident_text: 'Person having seizure in public', category: 'Medical Emergency', priority: 'High', department: 'Emergency Response' },
  { incident_text: 'Multiple people injured after stampede', category: 'Emergency Risk', priority: 'High', department: 'Emergency Response' }
];

const ALLOWED_DEPARTMENTS = new Set([
  'Police',
  'Women Safety Cell',
  'Municipal Corporation',
  'Traffic Police',
  'Fire Department',
  'Cyber Cell',
  'Child Protection',
  'Emergency Response'
]);

const PRIORITY_KEYWORDS = {
  High: ['knife', 'bomb', 'attack', 'fire', 'assault', 'bleeding', 'harassment', 'fight', 'threat', 'screaming', 'unconscious', 'child abuse', 'weapon'],
  Moderate: ['argument', 'bullying', 'shouting', 'stalking', 'traffic jam', 'suspicious outsider', 'blackmail', 'leak'],
  Low: ['garbage', 'streetlight', 'graffiti', 'parking issue', 'drain overflow']
};

const INTENT_RULES = [
  { phrases: ['knife', 'weapon', 'sharp object'], category: 'Weapon Threat', department: 'Police', minPriority: 'High' },
  { phrases: ['fighting', 'fight', 'assault', 'attacking'], category: 'Violence Risk', department: 'Police', minPriority: 'High' },
  { phrases: ['harassed', 'harassment', 'stalked', 'followed', 'eve teasing', 'unwanted touching'], category: 'Harassment', department: 'Women Safety Cell', minPriority: 'High' },
  { phrases: ['domestic', 'neighbour', 'apartment shouting', 'family violence'], category: 'Domestic Conflict', department: 'Police', minPriority: 'Moderate' },
  { phrases: ['mob', 'public property', 'riot', 'stampede', 'crowd panic'], category: 'Public Disorder', department: 'Police', minPriority: 'High' },
  { phrases: ['fire', 'smoke', 'gas leak', 'cylinder', 'short circuit', 'sparks'], category: 'Fire Hazard', department: 'Fire Department', minPriority: 'High' },
  { phrases: ['traffic', 'signal', 'parking', 'ambulance route', 'overspeeding', 'wrong side'], category: 'Traffic Hazard', department: 'Traffic Police', minPriority: 'Moderate' },
  { phrases: ['phishing', 'hacked', 'blackmail', 'online threat', 'threatening email', 'whatsapp'], category: 'Cyber Threat', department: 'Cyber Cell', minPriority: 'Moderate' },
  { phrases: ['child', 'minor', 'school children', 'child labor', 'child crying'], category: 'Child Safety', department: 'Child Protection', minPriority: 'High' },
  { phrases: ['collapsed', 'unconscious', 'seizure', 'bleeding', 'fainted', 'self harm'], category: 'Medical Emergency', department: 'Emergency Response', minPriority: 'High' },
  { phrases: ['garbage', 'drain overflow', 'toilet', 'waste'], category: 'Sanitation', department: 'Municipal Corporation', minPriority: 'Low' },
  { phrases: ['streetlight', 'manhole', 'broken road', 'footpath', 'water leakage'], category: 'Infrastructure Safety', department: 'Municipal Corporation', minPriority: 'Moderate' }
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'to', 'of', 'at', 'in', 'on', 'is', 'are', 'was', 'were', 'be', 'been',
  'with', 'for', 'by', 'from', 'near', 'this', 'that', 'it', 'as', 'after', 'during', 'outside', 'inside'
]);

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  return normalizeText(text).split(' ').filter(Boolean).filter((token) => !STOPWORDS.has(token));
}

function textBigrams(text) {
  const clean = normalizeText(text).replace(/\s/g, '');
  const grams = new Set();
  for (let i = 0; i < clean.length - 1; i += 1) grams.add(clean.slice(i, i + 2));
  return grams;
}

function jaccard(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  setA.forEach((item) => {
    if (setB.has(item)) intersection += 1;
  });
  const union = setA.size + setB.size - intersection;
  return union ? intersection / union : 0;
}

function keywordHits(text) {
  const normalized = normalizeText(text);
  const hits = { High: 0, Moderate: 0, Low: 0, matched: [] };

  Object.entries(PRIORITY_KEYWORDS).forEach(([level, words]) => {
    words.forEach((word) => {
      if (normalized.includes(word)) {
        hits[level] += 1;
        hits.matched.push(word);
      }
    });
  });

  return hits;
}

function priorityWeight(priority) {
  if (priority === 'High') return 3;
  if (priority === 'Moderate') return 2;
  return 1;
}

function maxPriority(a, b) {
  return priorityWeight(a) >= priorityWeight(b) ? a : b;
}

function minPriority(a, b) {
  return priorityWeight(a) <= priorityWeight(b) ? a : b;
}

function confidenceFromSignals(avgTopScore, intentHits, keywordStrength, agreementStrength) {
  const raw = 58 + avgTopScore * 36 + intentHits * 7 + keywordStrength * 3 + agreementStrength * 5;
  const bounded = Math.max(70, Math.min(99, Math.round(raw)));
  return `${bounded}%`;
}

function buildWordImpact(tokens, highWords, moderateWords, lowWords) {
  const unique = [...new Set(tokens)];
  return unique.slice(0, 14).map((word) => {
    let impact = 'Low';
    if (highWords.has(word)) impact = 'High';
    else if (moderateWords.has(word)) impact = 'Medium';
    else if (lowWords.has(word)) impact = 'Low';
    return { word, impact };
  });
}

export function analyzeIncidentText(inputText) {
  const text = normalizeText(inputText);
  if (!text || text.length < 5) return null;

  const inputTokens = tokenize(text);
  const inputTokenSet = new Set(inputTokens);
  const inputBigrams = textBigrams(text);
  const keywordSignal = keywordHits(text);  
  const scoredMatches = INCIDENT_DATASET.map((sample) => {
    const sampleTokens = tokenize(sample.incident_text);
    const sampleTokenSet = new Set(sampleTokens);
    const tokenScore = jaccard(inputTokenSet, sampleTokenSet);
    const fuzzyScore = jaccard(inputBigrams, textBigrams(sample.incident_text));
    const phraseBonus = text.includes(normalizeText(sample.incident_text)) ? 0.6 : 0;
    const prefixBonus = normalizeText(sample.incident_text).startsWith(text.slice(0, Math.min(12, text.length))) ? 0.15 : 0;

    const keywordOverlap = sampleTokens.filter((token) => inputTokenSet.has(token)).length;
    const overlapBoost = Math.min(0.28, keywordOverlap * 0.035);
    const score = tokenScore * 0.5 + fuzzyScore * 0.38 + overlapBoost + phraseBonus + prefixBonus;
    return { sample, score };
  }).sort((a, b) => b.score - a.score);

  const topMatches = scoredMatches.slice(0, 5);
  const bestMatch = topMatches[0]?.sample || INCIDENT_DATASET[0];
  const avgTopScore = topMatches.reduce((sum, m) => sum + m.score, 0) / Math.max(1, topMatches.length);

  const categoryVotes = {};
  const departmentVotes = {};
  const priorityVotes = { High: 0, Moderate: 0, Low: 0 };
  topMatches.forEach(({ sample, score }) => {
    categoryVotes[sample.category] = (categoryVotes[sample.category] || 0) + score;
    departmentVotes[sample.department] = (departmentVotes[sample.department] || 0) + score;
    priorityVotes[sample.priority] += score;
  });

  priorityVotes.High += keywordSignal.High * 1.8;
  priorityVotes.Moderate += keywordSignal.Moderate * 1.35;
  priorityVotes.Low += keywordSignal.Low * 1.0;

  const matchedRules = INTENT_RULES.filter((rule) =>
    rule.phrases.some((phrase) => text.includes(normalizeText(phrase)))
  );

  matchedRules.forEach((rule) => {
    categoryVotes[rule.category] = (categoryVotes[rule.category] || 0) + 1.6;
    departmentVotes[rule.department] = (departmentVotes[rule.department] || 0) + 1.6;
    priorityVotes[rule.minPriority] += 1.3;
    if (rule.minPriority === 'High') priorityVotes.High += 0.5;
  });

  const predictedPriority = Object.entries(priorityVotes).sort((a, b) => b[1] - a[1])[0][0];
  let finalPriority = predictedPriority;

  if (keywordSignal.High > 0) finalPriority = 'High';
  else if (keywordSignal.Moderate > 0) finalPriority = maxPriority(finalPriority, 'Moderate');
  else if (keywordSignal.Low > 0 && finalPriority !== 'High') finalPriority = minPriority(finalPriority, 'Moderate');

  const highWords = new Set(PRIORITY_KEYWORDS.High.map((w) => w.split(' ')).flat());
  const moderateWords = new Set(PRIORITY_KEYWORDS.Moderate.map((w) => w.split(' ')).flat());
  const lowWords = new Set(PRIORITY_KEYWORDS.Low.map((w) => w.split(' ')).flat());
  const wordAnalysis = buildWordImpact(inputTokens, highWords, moderateWords, lowWords);

  const topCategory = Object.entries(categoryVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || bestMatch.category || 'Public Disorder';
  const topDepartment = Object.entries(departmentVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || bestMatch.department || 'Police';
  const department = ALLOWED_DEPARTMENTS.has(topDepartment) ? topDepartment : 'Police';
  const category = topCategory;

  const agreementStrength = topMatches.filter(({ sample }) => sample.category === category).length >= 2 ? 1 : 0;
  const confidence = confidenceFromSignals(avgTopScore, matchedRules.length, keywordSignal.matched.length, agreementStrength);

  return {
    priority: finalPriority,
    category,
    department,
    confidence,
    escalationLikelihood:
      finalPriority === 'High'
        ? 'Immediate escalation recommended based on incident severity and matched risk patterns.'
        : finalPriority === 'Moderate'
          ? 'Moderate concern detected. Prompt departmental action is advised.'
          : 'Lower urgency pattern detected. Route to concerned civic authority.',
    keywords: [...new Set([...keywordSignal.matched, ...inputTokens.slice(0, 4)])].slice(0, 8),
    wordAnalysis,
    matchedExample: bestMatch.incident_text,
    similarExamples: topMatches.slice(0, 3).map(({ sample }) => sample.incident_text)
  };
}

