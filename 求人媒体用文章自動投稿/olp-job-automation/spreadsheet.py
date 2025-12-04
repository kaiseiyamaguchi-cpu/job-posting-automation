"""スプレッドシート操作モジュール（ADC認証版）"""
import gspread
from google.auth import default
from google.auth.transport.requests import Request

from config import SHEET_NAME, WORKSHEET_NAME

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
]


def connect_sheet():
    """
    ADC（Application Default Credentials）を使ってスプレッドシートに接続
    
    事前に `gcloud auth application-default login` を実行しておくこと
    """
    # ADC認証情報を自動取得（~/.config/gcloud/application_default_credentials.json）
    credentials, project = default(scopes=SCOPES)
    
    # 認証情報が期限切れの場合はリフレッシュ
    if credentials.expired:
        credentials.refresh(Request())
    
    # gspread クライアント作成
    client = gspread.authorize(credentials)
    
    # スプレッドシートを開く
    sheet = client.open(SHEET_NAME).worksheet(WORKSHEET_NAME)
    return sheet


def get_pending_rows(sheet):
    """ステータスが「投稿開始」の行を取得"""
    records = sheet.get_all_records()
    pending = []
    for i, row in enumerate(records):
        if row.get('ステータス') == '投稿開始':
            pending.append({
                'row_num': i + 2,  # ヘッダー行 + 0-indexed
                'input': row.get('元ネタ（Input）'),
                'indeed_text': row.get('Indeed用原稿'),
                'kyujinbox_text': row.get('求人ボックス用原稿'),
                'engage_text': row.get('エンゲージ用原稿'),
            })
    return pending


def update_status(sheet, row_num, status):
    """指定行のステータスを更新"""
    sheet.update_cell(row_num, 5, status)  # E列 = 5（列が1つ増えた）
