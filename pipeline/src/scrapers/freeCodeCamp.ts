// freeCodeCamp scraper
import axios from 'axios';

export async function scrapeFreeCodeCamp() {
  try {
    // URL to scrape
    const url = 'https://www.freecodecamp.org/api/courses';
    
    const response = await axios.get(url);
    const courses = response.data;

    return courses.map((course: any) => ({
      title: course.name,
      description: course.description,
      url: course.url,
      source: 'freeCodeCamp',
      difficulty: 'beginner',
      category: course.category || 'General',
      tags: course.tags || [],
    }));
  } catch (error) {
    console.error('Error scraping freeCodeCamp:', error);
    return [];
  }
}
