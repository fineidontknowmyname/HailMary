// Tag transformer - applies consistent tagging
export function applyTags(resource: any, additionalTags: string[] = []) {
  const extractedTags = new Set<string>();

  // Extract from title
  const titleWords = resource.title.toLowerCase().split(/\s+/);
  const commonTags = [
    'javascript',
    'python',
    'react',
    'vue',
    'angular',
    'typescript',
    'nodejs',
    'express',
  ];

  titleWords.forEach(word => {
    if (commonTags.includes(word)) extractedTags.add(word);
  });

  // Add category as tag
  if (resource.category) {
    extractedTags.add(resource.category.toLowerCase().replace(/\s+/g, '-'));
  }

  // Add provided tags
  additionalTags.forEach(tag => extractedTags.add(tag.toLowerCase()));

  return {
    ...resource,
    tags: Array.from(extractedTags),
  };
}
