"""設定ファイル"""

# スプレッドシート設定
SHEET_NAME = "OLP求人自動投稿デモ"  # スプレッドシート名
WORKSHEET_NAME = "Sheet1"           # シート名

# Chrome設定
CHROME_DEBUG_URL = "http://localhost:9222"

# 監視設定
POLLING_INTERVAL = 3  # 秒

# 投稿先設定 ('indeed' / 'kyujinbox' / 'engage' / 'google_form')
TARGET_SITE = 'indeed'

# 予備: Googleフォーム設定（各媒体接続失敗時用）
GOOGLE_FORM_URL = ""  # デモ用フォームのURL

# 各媒体のURL（参考）
MEDIA_URLS = {
    'indeed': 'https://jp.indeed.com/hire',
    'kyujinbox': 'https://xn--pckua2a7gp15o89zb.com/%E6%B1%82%E4%BA%BA%E6%8E%B2%E8%BC%89/',
    'engage': 'https://en-gage.net/company/',
}
