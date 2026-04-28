// Resource transformer - normalizes raw data from various sources
export function normalizeResource(rawData: any, source: string) {
  const baseResource = {
    title: rawData.title || rawData.name || 'Untitled',
    description: rawData.description || rawData.summary || '',
    url: rawData.url || rawData.link || '',
    source,
    difficulty: normalizeDifficulty(rawData.difficulty || rawData.level),
    category: normalizeCategory(rawData.category || rawData.domain),
    tags: normalizeTags(rawData.tags || []),
  };

  return baseResource;
}

function normalizeDifficulty(level: string): 'beginner' | 'intermediate' | 'advanced' {
  const normalized = level.toLowerCase();
  if (normalized.includes('beginner') || normalized.includes('basic')) return 'beginner';
  if (normalized.includes('advanced') || normalized.includes('expert')) return 'advanced';
  return 'intermediate';
}

function normalizeCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    web: 'Web Development',
    frontend: 'Web Development',
    backend: 'Web Development',
    dsa: 'Data Structures & Algorithms',
    ds: 'Data Science',
    ml: 'Machine Learning',
    devops: 'DevOps',
  };

  return categoryMap[category.toLowerCase()] || category;
}

function normalizeTags(tags: any): string[] {
  if (typeof tags === 'string') {
    return tags.split(',').map((t: string) => t.trim().toLowerCase());
  }
  return Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : [];
}
