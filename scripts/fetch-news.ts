import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import slugify from 'slugify';

// ─── Supabase (uses service role key for write access) ────────────────────────
const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const parser = new Parser({ timeout: 5000, maxRedirects: 3 });

// ─── Feed Definitions ─────────────────────────────────────────────────────────

const NEWS_FEEDS: { url: string; source: string; category: string }[] = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'Industry' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', category: 'Industry' },
  { url: 'https://venturebeat.com/ai/feed/', source: 'VentureBeat', category: 'Industry' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica', category: 'General' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face', category: 'Research' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost', category: 'Research' },
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'Industry' },
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News', category: 'General' },
];

const TOOL_FEEDS: { url: string; source: string }[] = [
  { url: 'https://www.producthunt.com/feed?category=artificial-intelligence', source: 'Product Hunt' },
  { url: 'https://news.ycombinator.com/rss', source: 'Hacker News' },
  { url: 'https://www.therundown.ai/rss', source: 'The Rundown AI' },
];

const GRAVEYARD_FEEDS = [
  'https://news.google.com/rss/search?q=AI+startup+"shuts+down"&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+company+acquired&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+tool+discontinued+OR+sunset&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+startup+"winds+down"&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+company+shutdown+2026&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+startup+acquisition+2026&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=acquires+AI+startup&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+company+"ceasing+operations"&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+service+closing+OR+closed+OR+ending&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=AI+product+killed+OR+"being+shut+down"&hl=en-US&gl=US&ceid=US:en',
];

const HYPE_FEEDS = [
  'https://news.google.com/rss/search?q=AI+will+by+2025+OR+2026+OR+2027+predicts&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q="AI+will+replace"+by+2026+OR+2027&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=artificial+intelligence+forecast+prediction+2026+OR+2027&hl=en-US&gl=US&ceid=US:en',
];

// ─── Incident Detection ───────────────────────────────────────────────────────

const INCIDENT_KEYWORDS = [
  'deepfake', 'deep fake', 'prompt injection', 'jailbreak', 'data breach',
  'data leak', 'ai bias', 'algorithm bias', 'discrimination', 'hallucination',
  'ai attack', 'ai scam', 'ai fraud', 'ai exploit', 'ai hack', 'ai hacked',
  'ai phishing', 'ai misinformation', 'ai disinformation', 'privacy violation',
  'ai misuse', 'ai incident', 'ai failure', 'ai error', 'ai harm',
  'facial recognition', 'wrongful arrest', 'ai generated', 'synthetic media',
  'model poisoning', 'adversarial', 'ai surveillance', 'ai manipulation',
];

const TYPE_PATTERNS: { type: string; keywords: string[] }[] = [
  { type: 'deepfake', keywords: ['deepfake', 'deep fake', 'synthetic media', 'ai generated video', 'ai generated image'] },
  { type: 'prompt-injection', keywords: ['prompt injection', 'jailbreak', 'prompt attack', 'adversarial prompt'] },
  { type: 'data-leak', keywords: ['data breach', 'data leak', 'privacy violation', 'exposed data', 'leaked data'] },
  { type: 'bias', keywords: ['ai bias', 'algorithm bias', 'discrimination', 'racial bias', 'gender bias', 'wrongful arrest'] },
  { type: 'hallucination', keywords: ['hallucination', 'fabricated', 'made up', 'false information', 'invented'] },
  { type: 'attack', keywords: ['ai attack', 'ai hack', 'ai exploit', 'model poisoning', 'adversarial attack', 'ai vulnerability'] },
  { type: 'scam', keywords: ['ai scam', 'ai fraud', 'ai phishing', 'voice clone', 'voice cloning', 'impersonation'] },
  { type: 'misinformation', keywords: ['ai misinformation', 'ai disinformation', 'ai propaganda', 'fake news', 'ai generated misinformation'] },
  { type: 'privacy', keywords: ['ai surveillance', 'ai tracking', 'privacy invasion', 'facial recognition abuse'] },
];

const SEVERITY_CRITICAL = [
  'nation-state', 'critical infrastructure', 'national security', 'cyberwar',
  'billions of', 'hundreds of millions', 'hospital', 'medical', 'power grid',
  'election', 'military', 'nuclear', 'assassination', 'genocide',
];

const SEVERITY_HIGH = [
  'millions of', 'millions of users', 'widespread', 'massive breach', 'large-scale',
  'federal', 'government', 'law enforcement', 'arrested', 'indicted', 'charged',
  'deepfake scam', 'voice clone fraud', 'financial fraud', 'identity theft',
  'data breach', 'exposed data', 'leaked database', 'ransomware',
  'child', 'minor', 'vulnerable', 'discrimination lawsuit', 'wrongful',
];

const SEVERITY_MEDIUM = [
  'thousands', 'hundreds of users', 'company', 'startup', 'bias found',
  'hallucination', 'misinformation', 'false information', 'privacy concern',
  'sued', 'lawsuit', 'complaint', 'investigation',
];

const SEVERITY_LOW = [
  'minor', 'small', 'limited', 'isolated', 'single user', 'one person',
  'researcher found', 'proof of concept', 'theoretical', 'demo', 'test',
];

// ─── Country Detection ────────────────────────────────────────────────────────
const COUNTRIES = [
  'United States', 'US', 'USA', 'United Kingdom', 'UK', 'China', 'Russia',
  'India', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'South Korea',
  'Brazil', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Israel', 'Iran',
  'North Korea', 'Ukraine', 'EU', 'Europe',
];

// ─── Tool Keywords ────────────────────────────────────────────────────────────
const TOOL_LAUNCH_KEYWORDS = [
  'launches', 'launch', 'introduces', 'unveils', 'releases', 'announces',
  'new ai tool', 'new model', 'show hn:', 'ask hn:',
];

// ─── Graveyard Patterns ───────────────────────────────────────────────────────
const GRAVEYARD_SHUTDOWN = [
  /^(.+?)\s+(?:shuts?|is shutting|winds?|shut|is winding)\s+down/i,
  /^(.+?)\s+(?:discontinues?|discontinued|is discontinued)/i,
  /^(.+?)\s+(?:is being|will be)\s+(?:shut down|discontinued|sunset|killed)/i,
  /^(.+?)\s+(?:sunsets?|sunsetting|killed|closing|closes)/i,
];

const GRAVEYARD_ACQUIRED_BY = [
  /^(.+?)\s+(?:acquired|bought|purchased)\s+by\s+(.+?)(?:\s+for\b|\s+in\b|\s*[,.]|$)/i,
  /^(.+?)\s+(?:to be acquired|to be bought)\s+by\s+(.+?)(?:\s+for\b|\s*[,.]|$)/i,
];

const GRAVEYARD_ACQUIRES = [
  /^(.+?)\s+(?:acquires?|buys?|purchases?|snaps? up)\s+(.+?)(?:\s+for\b|\s+in\b|\s*[,.]|$)/i,
];

const GRAVEYARD_PIVOT = [
  /^(.+?)\s+(?:pivots?|pivoting|refocuses?|rebrands?)/i,
];

// ─── Hype Patterns ────────────────────────────────────────────────────────────
const HYPE_PATTERNS = [
  /(?:ai|artificial intelligence|llm|gpt|robots?).+(?:will|could|may)\s+\w+.+(?:by|within|in)\s+(?:20[2-3]\d|\d+\s+years?)/i,
  /(?:predicts?|forecasts?|expects?|says?|claims?).+(?:ai|artificial intelligence).+(?:will|could)\s+/i,
  /(?:ai|artificial intelligence).+(?:will|could)\s+(?:replace|surpass|exceed|achieve|reach|eliminate|end|transform).+(?:by|within)\s+20[2-3]\d/i,
  /(?:agi|superintelligence|artificial general intelligence).+(?:by|within|in)\s+(?:20[2-3]\d|\d+\s+years?)/i,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAiRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return ['artificial intelligence', ' ai ', 'machine learning', 'deep learning',
    'neural network', 'large language model', 'llm', 'gpt', 'claude', 'gemini',
    'chatgpt', 'openai', 'anthropic', 'deepmind', 'generative ai',
  ].some((kw) => lower.includes(kw));
}

function isIncident(text: string): boolean {
  const lower = text.toLowerCase();
  return INCIDENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectIncidentType(text: string): string {
  const lower = text.toLowerCase();
  for (const { type, keywords } of TYPE_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return 'other';
}

function detectSeverity(text: string): string {
  const lower = text.toLowerCase();
  if (SEVERITY_CRITICAL.some((kw) => lower.includes(kw))) return 'critical';
  if (SEVERITY_HIGH.some((kw) => lower.includes(kw))) return 'high';
  if (SEVERITY_LOW.some((kw) => lower.includes(kw))) return 'low';
  if (SEVERITY_MEDIUM.some((kw) => lower.includes(kw))) return 'medium';
  const type = detectIncidentType(text);
  if (['deepfake', 'attack', 'scam'].includes(type)) return 'high';
  if (['data-leak', 'prompt-injection'].includes(type)) return 'medium';
  return 'low';
}

function detectCountry(text: string): string | null {
  return COUNTRIES.find((c) => text.includes(c)) ?? null;
}

function extractTags(title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  const tagMap: Record<string, string[]> = {
    'ChatGPT': ['chatgpt', 'chat gpt'],
    'OpenAI': ['openai'],
    'Google': ['google', 'gemini', 'bard'],
    'Meta': ['meta', 'llama'],
    'Anthropic': ['anthropic', 'claude'],
    'Microsoft': ['microsoft', 'copilot', 'azure ai'],
    'Deepfake': ['deepfake', 'deep fake'],
    'LLM': ['large language model', 'llm'],
    'Regulation': ['regulation', 'law', 'policy', 'ban', 'gdpr', 'eu ai act'],
    'Healthcare': ['medical', 'healthcare', 'hospital', 'diagnosis'],
    'Finance': ['finance', 'banking', 'trading', 'fraud'],
  };
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => combined.includes(kw))) tags.push(tag);
  }
  return tags.slice(0, 5);
}

function makeSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 80);
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

function cleanDescription(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*\[…\]\s*$/, '')
    .replace(/\s*\[\.\.\.\]\s*$/, '')
    .replace(/\s*…\s*$/, '')
    .trim()
    .slice(0, 800);
}

function isToolLaunch(title: string): boolean {
  return TOOL_LAUNCH_KEYWORDS.some((kw) => title.toLowerCase().includes(kw));
}

function detectToolCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('image') || text.includes('video') || text.includes('art')) return 'Creative';
  if (text.includes('code') || text.includes('developer') || text.includes('programming')) return 'Dev Tools';
  if (text.includes('chat') || text.includes('assistant') || text.includes('chatbot')) return 'Assistant';
  if (text.includes('search') || text.includes('research')) return 'Research';
  if (text.includes('voice') || text.includes('audio') || text.includes('speech')) return 'Audio';
  if (text.includes('data') || text.includes('analytics')) return 'Analytics';
  if (text.includes('write') || text.includes('content') || text.includes('text')) return 'Writing';
  if (text.includes('business') || text.includes('enterprise') || text.includes('workflow')) return 'Productivity';
  return 'General';
}

// Clean extracted company name — remove noise words from regex captures
function cleanName(raw: string): string {
  return raw
    .replace(/^(The|A|An)\s+/i, '')
    .replace(/\s+(?:looks?\s+to|seeks?\s+to|plans?\s+to|is\s+set\s+to|moves?\s+to|wants?\s+to|aims?\s+to|tries?\s+to)$/i, '')
    .replace(/\s+(?:AI|startup|company|tool|platform|app|service|firm)$/i, '')
    .trim()
    .slice(0, 80);
}

type GraveyardResult = {
  name: string;
  reason: 'shutdown' | 'acquired' | 'pivot';
  acquired_by: string | null;
} | null;

function extractGraveyardEntry(title: string): GraveyardResult {
  // Check acquired-by patterns ("X acquired by Y")
  for (const pattern of GRAVEYARD_ACQUIRED_BY) {
    const m = title.match(pattern);
    if (m) return { name: cleanName(m[1]), reason: 'acquired', acquired_by: cleanName(m[2]) };
  }

  // Check acquires patterns ("Y acquires X")
  for (const pattern of GRAVEYARD_ACQUIRES) {
    const m = title.match(pattern);
    if (m) return { name: cleanName(m[2]), reason: 'acquired', acquired_by: cleanName(m[1]) };
  }

  // Check pivot patterns
  for (const pattern of GRAVEYARD_PIVOT) {
    const m = title.match(pattern);
    if (m) return { name: cleanName(m[1]), reason: 'pivot', acquired_by: null };
  }

  // Check shutdown patterns
  for (const pattern of GRAVEYARD_SHUTDOWN) {
    const m = title.match(pattern);
    if (m) return { name: cleanName(m[1]), reason: 'shutdown', acquired_by: null };
  }

  return null;
}

function isPrediction(title: string): boolean {
  return HYPE_PATTERNS.some((p) => p.test(title));
}

// ─── Fetch Logic ─────────────────────────────────────────────────────────────

async function fetchFeed(url: string): Promise<Parser.Item[]> {
  try {
    const feed = await Promise.race([
      parser.parseURL(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      ),
    ]);
    return feed.items ?? [];
  } catch (err) {
    console.warn(`Failed to fetch ${url}:`, (err as Error).message);
    return [];
  }
}

async function processNewsFeeds() {
  console.log('📰 Fetching news feeds...');
  const newsItems: object[] = [];
  const incidentItems: object[] = [];

  for (const feed of NEWS_FEEDS) {
    const items = await fetchFeed(feed.url);
    console.log(`  ${feed.source}: ${items.length} items`);

    for (const item of items) {
      if (!item.title || !item.link) continue;

      const title = item.title;
      const description = cleanDescription(item.contentSnippet ?? item.content ?? item.summary ?? '');
      const combined = `${title} ${description}`;
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

      if (!isAiRelated(combined) && feed.category !== 'Research') continue;

      if (isIncident(combined)) {
        const tags = extractTags(title, description);
        incidentItems.push({
          title,
          slug: makeSlug(title),
          summary: description || title,
          source_url: item.link,
          source_name: feed.source,
          published_at: publishedAt,
          incident_type: detectIncidentType(combined),
          severity: detectSeverity(combined),
          country: detectCountry(combined),
          tags,
        });
      } else {
        newsItems.push({
          title,
          summary: description || title,
          source_url: item.link,
          source_name: feed.source,
          published_at: publishedAt,
          category: feed.category,
        });
      }
    }
  }

  if (newsItems.length > 0) {
    const { error } = await supabase
      .from('news_items')
      .upsert(newsItems, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) console.error('Error upserting news:', error.message);
    else console.log(`✅ Upserted ${newsItems.length} news items`);
  }

  if (incidentItems.length > 0) {
    const { error } = await supabase
      .from('incidents')
      .upsert(incidentItems, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) console.error('Error upserting incidents:', error.message);
    else console.log(`🚨 Upserted ${incidentItems.length} incidents`);
  }
}

async function processToolFeeds() {
  console.log('🛠 Fetching tool feeds...');
  const toolItems: object[] = [];

  for (const feed of TOOL_FEEDS) {
    const items = await fetchFeed(feed.url);
    console.log(`  ${feed.source}: ${items.length} items`);

    for (const item of items) {
      if (!item.title || !item.link) continue;

      const rawTitle = item.title;
      const dashIdx = rawTitle.search(/\s[—–-]\s/);
      const name = dashIdx > 0 ? rawTitle.slice(0, dashIdx).trim() : rawTitle;
      const tagline = dashIdx > 0 ? rawTitle.slice(dashIdx).replace(/^[\s—–-]+/, '').trim() : '';

      const rssDescription = cleanDescription(item.contentSnippet ?? item.content ?? '');
      const description = rssDescription.length > 30
        ? rssDescription
        : tagline.length > 10
          ? tagline
          : `${name} — discovered via ${feed.source}`;

      const combined = `${rawTitle} ${rssDescription}`;
      if (!isAiRelated(combined)) continue;
      if (feed.source === 'Hacker News' && !isToolLaunch(rawTitle)) continue;

      toolItems.push({
        name,
        description,
        url: item.link,
        category: detectToolCategory(rawTitle, description),
        launched_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  if (toolItems.length > 0) {
    const { error } = await supabase
      .from('tools')
      .upsert(toolItems, { onConflict: 'url', ignoreDuplicates: true });
    if (error) console.error('Error upserting tools:', error.message);
    else console.log(`✅ Upserted ${toolItems.length} tools`);
  }
}

async function processGraveyardFeeds() {
  console.log('⚰️ Fetching graveyard feeds...');
  const entries: object[] = [];

  for (const url of GRAVEYARD_FEEDS) {
    const items = await fetchFeed(url);
    console.log(`  ${url.slice(0, 60)}…: ${items.length} items`);

    for (const item of items) {
      if (!item.title || !item.link) continue;

      const title = item.title;
      if (!isAiRelated(title + ' ' + (item.contentSnippet ?? ''))) continue;

      const extracted = extractGraveyardEntry(title);
      if (!extracted || extracted.name.length < 2 || extracted.name.length > 60) continue;

      const description = cleanDescription(item.contentSnippet ?? item.content ?? '') || title;
      const shutdownDate = item.pubDate
        ? new Date(item.pubDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      entries.push({
        name: extracted.name,
        description: description.slice(0, 400),
        shutdown_date: shutdownDate,
        reason: extracted.reason,
        acquired_by: extracted.acquired_by,
        notes: `Auto-detected from: ${item.link}`,
        source_url: item.link,
      });
    }
  }

  if (entries.length > 0) {
    const { error } = await supabase
      .from('graveyard')
      .upsert(entries, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) console.error('Error upserting graveyard:', error.message);
    else console.log(`⚰️ Upserted ${entries.length} graveyard entries`);
  }
}

async function processHypeFeeds() {
  console.log('📊 Fetching hype/prediction feeds...');
  const predictions: object[] = [];

  for (const url of HYPE_FEEDS) {
    const items = await fetchFeed(url);
    console.log(`  ${url.slice(0, 60)}…: ${items.length} items`);

    for (const item of items) {
      if (!item.title || !item.link) continue;

      const title = item.title;
      if (!isAiRelated(title)) continue;
      if (!isPrediction(title)) continue;

      // Clean up Google News source attribution "(Source Name)" at end of title
      const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '').trim();
      const sourceName = item.creator ?? title.match(/-\s*([^-]+)$/)?.[1]?.trim() ?? 'News source';

      predictions.push({
        prediction: cleanTitle.slice(0, 500),
        predicted_by: sourceName.slice(0, 200),
        predicted_at: item.pubDate
          ? new Date(item.pubDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        reality: null,
        status: 'pending',
        verdict_date: null,
        source_url: item.link,
      });
    }
  }

  if (predictions.length > 0) {
    const { error } = await supabase
      .from('hype_items')
      .upsert(predictions, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) console.error('Error upserting hype items:', error.message);
    else console.log(`📊 Upserted ${predictions.length} hype predictions`);
  }
}

async function pruneOldRecords() {
  const newsCutoff = new Date();
  newsCutoff.setDate(newsCutoff.getDate() - 30);

  const { error: newsError } = await supabase
    .from('news_items')
    .delete()
    .lt('published_at', newsCutoff.toISOString());

  if (newsError) console.warn('Prune news error:', newsError.message);
  else console.log('🗑 Pruned news items older than 30 days');

  const graveyardCutoff = new Date();
  graveyardCutoff.setDate(graveyardCutoff.getDate() - 90);

  const { error: graveyardError } = await supabase
    .from('graveyard')
    .delete()
    .lt('shutdown_date', graveyardCutoff.toISOString().split('T')[0]);

  if (graveyardError) console.warn('Prune graveyard error:', graveyardError.message);
  else console.log('🗑 Pruned graveyard entries older than 90 days');
}

// ─── AI Verdict Processing ────────────────────────────────────────────────────

async function processHypeVerdicts() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⏭ Skipping AI verdicts — no ANTHROPIC_API_KEY set');
    return;
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { data: pending, error } = await supabase
    .from('hype_items')
    .select('id, prediction, predicted_by, predicted_at')
    .eq('status', 'pending')
    .order('predicted_at', { ascending: true })
    .limit(20);

  if (error || !pending?.length) {
    console.log('📊 No pending hype items to evaluate');
    return;
  }

  console.log(`📊 Evaluating ${pending.length} pending hype items...`);
  const today = new Date().toISOString().split('T')[0];
  let resolved = 0;

  for (const item of pending) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Today is ${today}. Evaluate whether this AI prediction came true.

Prediction: "${item.prediction}"
Predicted by: ${item.predicted_by}
Prediction date: ${item.predicted_at}

Reply with JSON only — no other text:
{
  "verdict": "confirmed" | "busted" | "partial" | "pending",
  "confidence": <integer 0-100>,
  "reality": "<1-2 sentence factual summary of what actually happened>"
}

Rules:
- "pending" if the deadline hasn't passed yet or you genuinely don't know
- "confirmed" if it clearly came true as stated
- "busted" if it clearly did not come true
- "partial" if it came true but was overstated or understated
- Set confidence < 60 if uncertain — it will stay pending for re-evaluation later
- reality must be factual, not an opinion`,
        }],
      });

      const raw = (message.content[0] as { type: string; text: string }).text.trim();
      const json = JSON.parse(raw.replace(/^```json\n?|\n?```$/g, ''));

      if (!json.verdict || typeof json.confidence !== 'number') continue;

      if (json.confidence >= 70 && json.verdict !== 'pending') {
        await supabase.from('hype_items').update({
          status: json.verdict,
          reality: json.reality ?? null,
          verdict_date: today,
          confidence_score: json.confidence,
        }).eq('id', item.id);
        resolved++;
        console.log(`  ✓ [${json.confidence}%] ${json.verdict.toUpperCase()} — ${item.prediction.slice(0, 60)}…`);
      } else {
        await supabase.from('hype_items').update({
          confidence_score: json.confidence,
        }).eq('id', item.id);
        console.log(`  ~ [${json.confidence}%] still pending — ${item.prediction.slice(0, 60)}…`);
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`  ✗ Failed to evaluate item ${item.id}:`, (err as Error).message);
    }
  }

  console.log(`📊 Resolved ${resolved}/${pending.length} hype items`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🤖 AIWatch Fetch Script — ${new Date().toISOString()}\n`);

  if ((!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  await processNewsFeeds();
  await processToolFeeds();
  await processGraveyardFeeds();
  await processHypeFeeds();
  await processHypeVerdicts();
  await pruneOldRecords();

  console.log('\n✨ Done!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
