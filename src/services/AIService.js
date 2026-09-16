import { GoogleGenerativeAI } from "@google/generative-ai";

class AIService {
  /**
   * Initializes the Gemini model with the provided API key.
   */
  _getModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Improves existing text to be more professional.
   */
  async improveText(text, apiKey) {
    try {
      const model = this._getModel(apiKey);
      const prompt = `As a technical writer, improve this README section to be professional, concise, and engaging. Return only the improved text:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || text;
    } catch (e) {
      console.error('AI Improve Error:', e);
      return text;
    }
  }

  /**
   * Generates a short engaging description for a topic.
   */
  async generateDescription(topic, apiKey) {
    try {
      const model = this._getModel(apiKey);
      const prompt = `Generate a short engaging description for: ${topic}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || `A project about ${topic}`;
    } catch (e) {
      console.error('AI Desc Error:', e);
      return `A project about ${topic}`;
    }
  }

  /**
   * Magic Compose: Generates a full ReadmeElement list based on a prompt.
   */
  async magicCompose(prompt, apiKey) {
    const model = this._getModel(apiKey);
    const aiPrompt = `
      You are an expert GitHub README generator. Based on this description: "${prompt}",
      generate a professional README structure.
      Return the response ONLY as a JSON array of objects.
      Each object must have a "type" field and data fields.
      Supported types:
      - "heading" (text, level: 1-3)
      - "paragraph" (text)
      - "list" (items: list of strings, isOrdered: bool)
      - "codeBlock" (code, language)
      - "divider" (no extra fields)

      Example: [{"type": "heading", "text": "Project Name", "level": 1}, {"type": "divider"}]
      Return ONLY the raw JSON. No markdown backticks.
    `;

    let cleanJson = '';
    try {
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      cleanJson = response
        .text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    } catch (e) {
      console.error('Magic Compose Error:', e);
      throw new Error(e?.message || 'AI request failed. Please try again.');
    }

    try {
      return JSON.parse(cleanJson || '[]');
    } catch (e) {
      console.error('Magic Compose JSON Error:', e);
      throw new Error('AI returned an invalid response. Try a shorter, more specific prompt.');
    }
  }

  /**
   * Analyzes project elements and provides a health score.
   */
  calculateHealthScore(elements) {
    if (!elements || elements.length === 0) return 0.0;
    let score = 0.0;

    const hasH1 = elements.some(e => e.type === 'heading' && e.level === 1);
    const hasImage = elements.some(e => e.type === 'image');
    const hasCode = elements.some(e => e.type === 'code');
    const hasSocials = elements.some(e => e.type === 'socials');

    if (hasH1) score += 30;
    if (hasImage) score += 20;
    if (hasCode) score += 20;
    if (hasSocials) score += 10;
    if (elements.length > 5) score += 20;

    return Math.min(Math.max(score, 0), 100);
  }
}

export default new AIService();
