from flask import Flask, request, jsonify, render_template_string
import requests
from bs4 import BeautifulSoup
import re
import os

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

def summarize_text(text):
    """テキストを1行で要約"""
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
        
        # 要約を生成
        summary = summarize_text(main_content)
        
        return jsonify({'summary': summary})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'ページの取得に失敗しました: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'処理中にエラーが発生しました: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)