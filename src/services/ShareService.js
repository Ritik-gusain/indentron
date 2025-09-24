const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const snippetsFilePath = path.join(__dirname, '..', '..', 'snippets.json');

class ShareService {
  constructor() {
    this.snippets = this.loadSnippets();
  }

  loadSnippets() {
    try {
      if (fs.existsSync(snippetsFilePath)) {
        const data = fs.readFileSync(snippetsFilePath, 'utf8');
        return new Map(Object.entries(JSON.parse(data)));
      }
    } catch (error) {
      console.error('Error loading snippets:', error);
    }
    return new Map();
  }

  createSnippet(code, language) {
    const id = crypto.randomBytes(4).toString('hex');
    this.snippets.set(id, { code, language });
    this.saveSnippets();
    return id;
  }

  getSnippet(id) {
    return this.snippets.get(id);
  }
  saveSnippets() {
    try {
      const snippetsObj = Object.fromEntries(this.snippets);
      fs.writeFileSync(snippetsFilePath, JSON.stringify(snippetsObj, null, 2));
    } catch (error) {
      console.error('Error saving snippets:', error);
    }
  }
}

module.exports = ShareService;