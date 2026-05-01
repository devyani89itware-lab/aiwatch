import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import slugify from 'slugify';

// ─── Supabase (uses service role key for write access) ────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL!,
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

const SEVERITY_HIGH = ['critical', 'major', 'massive', 'widespread', 'millions', 'billion', 'national', 'government', 'federal', 'breach'];
const SEVERITY_LOW = ['minor', 'small', 'limited', 'isolated', 'single', 'one person'];

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
  if (SEVERITY_HIGH.some((kw) => lower.includes(kw))) return 'high';
  if (SEVERITY_LOW.some((kw) => lower.includes(kw))) return 'low';
  return 'medium';
}

function detectCountry(text: string): string | null {
  const found = COUNTRIES.find((c) => text.includes(c));
  return found ?? null;
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
    if (keywords.some((kw) => combined.includes(kw))) {
      tags.push(tag);
    }
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
    .trim()
    .slice(0, 800);
}

function isToolLaunch(title: string): boolean {
  const lower = title.toLowerCase();
  return TOOL_LAUNCH_KEYWORDS.some((kw) => lower.includes(kw));
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
        // Route to incidents
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
        // Route to general news
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

  // Upsert news items (deduplicate by source_url)
  if (newsItems.length > 0) {
    const { error } = await supabase
      .from('news_items')
      .upsert(newsItems, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) console.error('Error upserting news:', error.message);
    else console.log(`✅ Upserted ${newsItems.length} news items`);
  }

  // Upsert incidents (deduplicate by source_url via slug collision check)
  if (incidentItems.length > 0) {
    const { error } = await supabase
      .from('incidents')
      .insert(incidentItems);
    if (error) console.error('Error inserting incidents:', error.message);
    else console.log(`🚨 Inserted ${incidentItems.length} incidents`);
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

      const title = item.title;
      const description = cleanDescription(item.contentSnippet ?? item.content ?? '');
      const combined = `${title} ${description}`;

      if (!isAiRelated(combined)) continue;
      if (feed.source === 'Hacker News' && !isToolLaunch(title)) continue;

      toolItems.push({
        name: title,
        description: description || title,
        url: item.link,
        category: detectToolCategory(title, description),
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

async function pruneOldRecords() {
  // Keep only the last 30 days of news (to stay within Supabase free tier)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const { error } = await supabase
    .from('news_items')
    .delete()
    .lt('published_at', cutoff.toISOString());

  if (error) console.warn('Prune error:', error.message);
  else console.log('🗑 Pruned news items older than 30 days');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🤖 AIWatch Fetch Script — ${new Date().toISOString()}\n`);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  await processNewsFeeds();
  await processToolFeeds();
  await pruneOldRecords();

  console.log('\n✨ Done!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
