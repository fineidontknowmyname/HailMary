// YouTube API fetcher
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function fetchYouTubeChannels(channelIds: string[]) {
  try {
    const url = 'https://www.googleapis.com/youtube/v3/channels';

    const resources = [];

    for (const channelId of channelIds) {
      const response = await axios.get(url, {
        params: {
          part: 'snippet,contentDetails',
          id: channelId,
          key: YOUTUBE_API_KEY,
        },
      });

      const channel = response.data.items[0];
      resources.push({
        title: channel.snippet.title,
        description: channel.snippet.description,
        url: `https://youtube.com/c/${channel.snippet.customUrl}`,
        source: 'YouTube',
        difficulty: 'beginner',
        category: 'Video Tutorials',
        tags: ['youtube', 'tutorial'],
      });
    }

    return resources;
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    return [];
  }
}
