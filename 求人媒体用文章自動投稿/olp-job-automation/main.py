"""メインスクリプト: スプレッドシート監視 & 自動投稿"""
import time

from config import POLLING_INTERVAL
from spreadsheet import connect_sheet, get_pending_rows, update_status
from browser import run_automation


def main():
    print("=" * 50)
    print("🚀 OLP求人オートメーション デモツール")
    print("=" * 50)
    print("📋 対応媒体: Indeed / 求人ボックス / エンゲージ")
    print("👀 スプレッドシート監視開始...")
    print(f"📊 ポーリング間隔: {POLLING_INTERVAL}秒")
    print("-" * 50)
    
    sheet = connect_sheet()
    print("✅ スプレッドシートに接続しました（ADC認証）")
    
    while True:
        try:
            # 「投稿開始」の行を取得
            pending_rows = get_pending_rows(sheet)
            
            for row in pending_rows:
                print(f"\n👉 {row['row_num']}行目の投稿リクエストを検知！")
                
                # 自動化実行
                success = run_automation(
                    row['indeed_text'],
                    row['kyujinbox_text'],
                    row['engage_text']
                )
                
                if success:
                    update_status(sheet, row['row_num'], '完了')
                    print("🎉 ステータスを『完了』に更新しました")
                else:
                    update_status(sheet, row['row_num'], 'エラー')
                    print("⚠️ ステータスを『エラー』に更新しました")
            
            time.sleep(POLLING_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n👋 監視を終了します")
            break
        except Exception as e:
            print(f"⚠️ ループエラー: {e}")
            print("5秒後にリトライします...")
            time.sleep(5)


if __name__ == "__main__":
    main()
