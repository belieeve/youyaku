from flask import Flask, request, jsonify, render_template_string
import requests
from bs4 import BeautifulSoup
import re
import os
import google.generativeai as genai

app = Flask(__name__)

def clean_text(text):
    """テキストをクリーニングして読みやすくする"""
    # 改行や余分なスペースを削除
    text = re.sub(r'\s+', ' ', text)
    # 特殊文字を削除
    text = re.sub(r'[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u002D\u0021-\u007E]', '', text)
    return text.strip()

def extract_main_content(soup):
    """メインコンテンツを抽出"""
    # 不要なタグを削除
    for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement']):
        tag.decompose()
    
    # メインコンテンツを探す
    main_content = ""
    
    # title要素
    title = soup.find('title')
    if title:
        main_content += title.get_text() + " "
    
    # meta descriptionがあれば使用
    meta_desc = soup.find('meta', {'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        main_content += meta_desc['content'] + " "
    
    # h1-h3タグを優先的に取得
    headers = soup.find_all(['h1', 'h2', 'h3'])
    for header in headers:
        main_content += header.get_text() + " "
    
    # pタグのテキストを取得
    paragraphs = soup.find_all('p')
    for p in paragraphs:
        text = p.get_text()
        if len(text) > 20:  # 短すぎるものは除外
            main_content += text + " "
    
    return clean_text(main_content)

def summarize_with_gemini(text):
    """GeminiAPIを使用してテキストを要約"""
    try:
        # GeminiAPIの設定
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return "GeminiAPIキーが設定されていません。"
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # プロンプトを作成
        prompt = f"""
        以下のテキストを1行で簡潔に要約してください。日本語で回答してください。
        要約は50文字以内でお願いします。
        
        テキスト:
        {text[:2000]}  # 最初の2000文字まで
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        # GeminiAPIが使用できない場合は従来の方法にフォールバック
        return summarize_text_fallback(text)

def summarize_text_fallback(text):
    """フォールバック用の従来の要約機能"""
    if not text:
        return "要約できるコンテンツが見つかりませんでした。"
    
    # テキストの長さに応じて要約の長さを調整
    sentences = text.split('.')
    if len(sentences) <= 1:
        sentences = text.split('。')
    
    # 最初の数文を使用して要約を作成
    summary = ""
    for sentence in sentences[:3]:  # 最初の3文まで
        if sentence.strip():
            summary += sentence.strip() + "。"
            if len(summary) > 100:  # 100文字程度で切る
                break
    
    if not summary:
        # 文が分けられない場合は最初の100文字を使用
        summary = text[:100] + "..." if len(text) > 100 else text
    
    return summary

@app.route('/')
def index():
    """HTMLファイルを読み込んで表示"""
    try:
        with open('/Users/shin/url_summarizer.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        return html_content
    except FileNotFoundError:
        return "HTMLファイルが見つかりません", 404

@app.route('/summarize', methods=['POST'])
def summarize():
    """URL要約API"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URLが指定されていません'}), 400
        
        # URLの形式チェック
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # ユーザーエージェントを設定してリクエスト
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # ページを取得
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # 文字エンコーディングを設定
        response.encoding = response.apparent_encoding
        
        # HTMLを解析
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # メインコンテンツを抽出
        main_content = extract_main_content(soup)
        
        # 要約を生成（GeminiAPI使用）
        summary = summarize_with_gemini(main_content)
        
        return jsonify({'summary': summary})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'ページの取得に失敗しました: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'処理中にエラーが発生しました: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)