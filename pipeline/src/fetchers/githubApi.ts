// GitHub API fetcher
import axios from 'axios';

const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

export async function fetchGitHubRepositories(queries: string[]) {
  try {
    const resources = [];

    for (const query of queries) {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: query,
          sort: 'stars',
          per_page: 10,
        },
        headers: {
          Authorization: `token ${GITHUB_API_TOKEN}`,
        },
      });

      response.data.items.forEach((repo: any) => {
        resources.push({
          title: repo.name,
          description: repo.description,
          url: repo.html_url,
          source: 'GitHub',
          difficulty: 'intermediate',
          category: 'Open Source',
          tags: repo.topics || [],
        });
      });
    }

    return resources;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}
