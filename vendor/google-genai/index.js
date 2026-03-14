export class GoogleGenAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.models = {
      generateContent: this.generateContent.bind(this)
    };
  }

  async generateContent({ model, contents, config = {} }) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: config })
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '{}';
    return { text };
  }
}
