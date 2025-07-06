# URL要約サービス

URLを入力すると、そのページの内容を1行で要約してくれるサービスです。

## デモ

GitHub Pagesで公開されているデモ版：
https://[あなたのGitHubユーザー名].github.io/url-summarizer/

## 機能

- URLを入力するだけで簡単に要約を取得
- 日本語対応
- レスポンシブデザイン
- エラーハンドリング

## ローカルでの使用方法

### 必要なもの

- Python 3.7以上
- pip

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/[あなたのGitHubユーザー名]/url-summarizer.git
cd url-summarizer

# 依存関係をインストール
pip install -r requirements.txt
```

### 実行

```bash
# サーバーを起動
python url_summarizer.py

# ブラウザで http://localhost:5000 にアクセス
```

## 技術仕様

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Python Flask
- **ライブラリ**: 
  - Flask: Webフレームワーク
  - requests: HTTP通信
  - BeautifulSoup4: HTML解析
  - lxml: XML/HTML解析エンジン

## ライセンス

MIT License