# 開発者向けセットアップガイド

## Gemini APIキーの設定

このサービスを稼働させるには、開発者がGemini APIキーを設定する必要があります。

### 手順

1. **Gemini APIキーを取得**
   - [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
   - Googleアカウントでログイン
   - 新しいAPIキーを作成

2. **index.htmlを編集**
   ```javascript
   // この行を見つけて
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   
   // あなたの実際のAPIキーに置き換える
   const GEMINI_API_KEY = 'AIzaSyA...your-actual-api-key-here';
   ```

3. **デプロイ**
   - 変更をコミット・プッシュ
   - GitHub Pagesで自動デプロイされます

### セキュリティ注意事項

⚠️ **重要**: このAPIキーはクライアントサイドに露出されます。

**推奨事項:**
- APIキーに使用制限を設定（リファラー制限など）
- API使用量の監視を有効にする
- 定期的にAPIキーをローテーションする

### デプロイ後

利用者は以下の手順で使用できます：
1. URLを入力
2. 「要約を取得」ボタンをクリック
3. Gemini AIが自動で要約を生成

APIキーが未設定の場合は、基本的な要約（メタデータベース）にフォールバックします。