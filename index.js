
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route for the HTML frontend
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL要約サービス</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; background-color: #f8f9fa; }
        h1 { text-align: center; color: #444; }
        form { display: flex; gap: 10px; margin-bottom: 20px; }
        input[type="url"] { flex-grow: 1; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
        button { padding: 12px 24px; border: none; background-color: #007bff; color: white; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background-color 0.2s; }
        button:hover { background-color: #0056b3; }
        #result-container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-height: 100px;}
        #loading { text-align: center; display: none; padding: 20px; font-size: 18px; color: #555; }
        .error { color: #d9534f; font-weight: bold; }
        #result h3 { margin-top: 0; }
        #result h3 a { color: #0056b3; text-decoration: none; }
        #result h3 a:hover { text-decoration: underline; }
        #result p { font-size: 1.1em; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>URLを1行で要約します</h1>
    <form id="summary-form">
        <input type="url" id="url-input" placeholder="要約したいURLを入力" required>
        <button type="submit">要約</button>
    </form>
    <div id="result-container">
        <div id="loading">要約中...</div>
        <div id="result"></div>
    </div>

    <script>
        const form = document.getElementById('summary-form');
        const urlInput = document.getElementById('url-input');
        const resultDiv = document.getElementById('result');
        const loadingDiv = document.getElementById('loading');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = urlInput.value;
            if (!url) return;

            resultDiv.innerHTML = '';
            loadingDiv.style.display = 'block';

            try {
                const response = await fetch(`/summarize?url=${encodeURIComponent(url)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '要約に失敗しました。');
                }

                resultDiv.innerHTML = `
                    <h3><a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a></h3>
                    <p>${data.summary}</p>
                `;
            } catch (error) {
                resultDiv.innerHTML = `<p class="error">エラー: ${error.message}</p>`;
            } finally {
                loadingDiv.style.display = 'none';
            }
        });
    </script>
</body>
</html>
    `);
});

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
