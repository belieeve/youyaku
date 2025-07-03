
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/summarize', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. Fetch the URL
    const response = await fetch(url);
    const html = await response.text();

    // 2. Extract the main content using Readability
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return res.status(500).json({ error: 'Could not extract content from the URL' });
    }

    // 3. Summarize using Gemini Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `以下の文章を日本語で1行で要約してください。

${article.textContent}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // 4. Return the summary as JSON
    res.json({
      title: article.title,
      url: url,
      summary: summary.trim(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the URL' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
