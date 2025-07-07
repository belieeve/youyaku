# URL要約サービス with Gemini AI

URLを入力すると、そのページの内容をAIが1行で要約してくれるサービスです。

## デモ

GitHub Pagesで公開されているデモ版：
https://belieeve.github.io/youyaku/

## 機能

- URLを入力するだけで簡単に要約を取得
- **Gemini AIによる高精度要約** ✨
- 日本語対応
- レスポンシブデザイン
- エラーハンドリング
- API使用時のフォールバック機能

## ローカルでの使用方法

### 必要なもの

- Python 3.7以上
- pip

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/belieeve/youyaku.git
cd youyaku

# 依存関係をインストール
pip install -r url-summarizer/requirements.txt
```

### Gemini API設定（オプション）

```bash
# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# GEMINI_API_KEY=your_actual_api_key_here
```

**Gemini APIキーの取得方法:**
1. https://makersuite.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. 新しいAPIキーを作成

### 実行

```bash
# サーバーを起動
python url-summarizer/url_summarizer.py

# ブラウザで http://localhost:5000 にアクセス
```

## 技術仕様

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Python Flask
- **AI**: Google Gemini API
- **ライブラリ**: 
  - Flask: Webフレームワーク
  - requests: HTTP通信
  - BeautifulSoup4: HTML解析
  - lxml: XML/HTML解析エンジン
  - google-generativeai: Gemini API連携

## 使用方法

### Webデモ版
1. https://belieeve.github.io/youyaku/ にアクセス
2. URLを入力
3. （オプション）Gemini APIキーを入力してAI要約を有効化
4. 「要約を取得」ボタンをクリック

### ローカル完全版
1. 上記のインストール手順に従って環境構築
2. Gemini APIキーを環境変数に設定
3. Pythonサーバーを起動
4. 高精度AI要約機能が利用可能

## ライセンス

MIT License