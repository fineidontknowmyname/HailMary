// Striver scraper
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeStriver() {
  try {
    const url = 'https://www.striver.in/';
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const resources = $('a.course-link').map((i, el) => ({
      title: $(el).find('.title').text(),
      description: $(el).find('.description').text(),
      url: $(el).attr('href'),
      source: 'Striver',
      difficulty: 'intermediate',
      category: 'DSA',
      tags: ['algorithms', 'data-structures'],
    }));

    return resources.get();
  } catch (error) {
    console.error('Error scraping Striver:', error);
    return [];
  }
}
