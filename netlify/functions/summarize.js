const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POSTリクエストのみ処理
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // リクエストボディをパース
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URLが指定されていません' }),
      };
    }

    // URLのコンテンツを取得（CORS回避）
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ページのコンテンツを取得できませんでした' }),
      };
    }

    // HTMLからテキストを抽出（Node.js環境用）
    const cheerio = require('cheerio');
    const $ = cheerio.load(data.contents);
    
    // 不要な要素を削除
    $('script, style, nav, header, footer, aside').remove();
    
    // タイトルとメインコンテンツを取得
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const headings = $('h1, h2, h3').map((i, el) => $(el).text()).get().join(' ');
    const paragraphs = $('p').map((i, el) => $(el).text()).get().join(' ');
    
    const content = `${title} ${metaDescription} ${headings} ${paragraphs}`.substring(0, 2000);

    // Gemini APIの設定
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Gemini APIキーが設定されていません' }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 要約を生成
    const prompt = `以下のWebページの内容を日本語で50文字以内で簡潔に要約してください:\n\n${content}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ summary }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `要約処理中にエラーが発生しました: ${error.message}` }),
    };
  }
};