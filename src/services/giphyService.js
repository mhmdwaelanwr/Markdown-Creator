// GiphyService (React Native)
// Uses fetch for GIPHY API
export class GiphyService {
  static apiKey = ''; // Configure at runtime; never commit API keys.
  static baseUrl = 'https://api.giphy.com/v1/gifs';

  static async searchGifs(query) {
    if (!query) return [];
    const url = `${this.baseUrl}/search?api_key=${this.apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return data.data.map(gif => gif.images.fixed_height.url);
    }
    throw new Error('Failed to load GIFs');
  }

  static async getTrendingGifs() {
    const url = `${this.baseUrl}/trending?api_key=${this.apiKey}&limit=20&rating=g`;
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return data.data.map(gif => gif.images.fixed_height.url);
    }
    throw new Error('Failed to load GIFs');
  }
}
