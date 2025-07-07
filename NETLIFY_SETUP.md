# Netlify Functions 設定ガイド（最も安全な方法）

## なぜNetlify Functionsが最も安全か？

✅ **完全なAPIキー隠蔽**: サーバーサイドでのみ実行、クライアントから見えない
✅ **環境変数による管理**: コードに一切キーが露出しない
✅ **制御可能**: アクセス制限やレート制限が可能
✅ **監視可能**: 使用量とアクセスログを確認できる

## 設定手順

### 1. Netlifyアカウント作成
1. [Netlify](https://netlify.com) にアクセス
2. GitHubアカウントでサインアップ

### 2. GitHubリポジトリを接続
1. Netlify ダッシュボードで「New site from Git」
2. GitHubを選択
3. `belieeve/youyaku` リポジトリを選択
4. Deploy settings:
   - Build command: `npm run build`
   - Publish directory: `./`
5. 「Deploy site」をクリック

### 3. 環境変数を設定
1. デプロイ後、Site settings → Environment variables
2. 「Add variable」をクリック
3. 設定内容:
   ```
   Key: GEMINI_API_KEY
   Value: あなたの新しいGeminiAPIキー
   ```
4. 「Save」をクリック

### 4. 新しいGemini APIキーを取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 古いキーを削除
3. 新しいAPIキーを作成
4. APIキーに制限を設定:
   - Application restrictions: HTTP referrers
   - Website restrictions: `*.netlify.app/*`

### 5. デプロイを再実行
1. Netlify ダッシュボードで「Trigger deploy」
2. 数分で完了

## 完成！

あなたのサイトURL: `https://your-site-name.netlify.app`

**セキュリティレベル**: 🔒🔒🔒🔒🔒 (最高)
- APIキーは完全に隠蔽
- 不正使用はほぼ不可能
- 使用量を完全制御

## 利用者体験
- URLを入力するだけ
- Gemini AIによる高精度要約
- 設定不要で即座に利用可能

この方法なら、APIキーが他の人に見られることは絶対にありません。