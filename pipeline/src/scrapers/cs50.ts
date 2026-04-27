// CS50 scraper
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeCS50() {
  try {
    const url = 'https://cs50.harvard.edu/';
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const resources = $('div.course').map((i, el) => ({
      title: $(el).find('h2').text(),
      description: $(el).find('p').text(),
      url: $(el).attr('data-href'),
      source: 'CS50',
      difficulty: 'intermediate',
      category: 'Computer Science',
      tags: ['cs', 'harvard', 'fundamentals'],
    }));

    return resources.get();
  } catch (error) {
    console.error('Error scraping CS50:', error);
    return [];
  }
}
