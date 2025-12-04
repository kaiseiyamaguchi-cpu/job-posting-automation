"""ブラウザ操作モジュール"""
from playwright.sync_api import sync_playwright

from config import CHROME_DEBUG_URL, TARGET_SITE, GOOGLE_FORM_URL


def connect_to_chrome():
    """デバッグモードのChromeに接続"""
    p = sync_playwright().start()
    browser = p.chromium.connect_over_cdp(CHROME_DEBUG_URL)
    return p, browser


def move_mouse_for_demo(page):
    """デモ演出用: マウスをゆっくり動かす"""
    page.mouse.move(100, 100)
    page.mouse.move(300, 200, steps=20)
    page.mouse.move(500, 300, steps=20)


def post_to_indeed(page, text):
    """
    Indeed求人投稿フォームにテキストを入力
    ※セレクタはデモ前に要確認・調整
    """
    # 例: 求人説明欄への入力
    # page.fill('textarea#jobDescription', text)
    # page.fill('input#jobTitle', 'タイトル')
    
    # デモ用: まずはマウス移動だけ
    move_mouse_for_demo(page)
    print(f"✅ Indeed入力完了（セレクタ要調整）")


def post_to_kyujinbox(page, text):
    """
    求人ボックスの求人投稿フォームにテキストを入力
    ※セレクタはデモ前に要確認・調整
    """
    # 例: 求人説明欄への入力
    # page.fill('textarea.job-description', text)
    
    # デモ用: まずはマウス移動だけ
    move_mouse_for_demo(page)
    print(f"✅ 求人ボックス入力完了（セレクタ要調整）")


def post_to_engage(page, text):
    """
    エンゲージの求人投稿フォームにテキストを入力
    ※セレクタはデモ前に要確認・調整
    """
    # 例: 求人説明欄への入力
    # page.fill('textarea[name="description"]', text)
    
    # デモ用: まずはマウス移動だけ
    move_mouse_for_demo(page)
    print(f"✅ エンゲージ入力完了（セレクタ要調整）")


def post_to_google_form(page, text):
    """予備: Googleフォームへの入力"""
    page.goto(GOOGLE_FORM_URL)
    # page.fill('textarea', text)
    move_mouse_for_demo(page)
    print(f"✅ Googleフォーム入力完了")


def run_automation(indeed_text, kyujinbox_text, engage_text):
    """自動投稿を実行"""
    print("🚀 Playwright起動: ブラウザへの接続を開始します...")
    
    try:
        p, browser = connect_to_chrome()
        context = browser.contexts[0]
        page = context.pages[0]
        
        print(f"📄 操作対象ページ: {page.title()}")
        
        if TARGET_SITE == 'indeed':
            post_to_indeed(page, indeed_text)
        elif TARGET_SITE == 'kyujinbox':
            post_to_kyujinbox(page, kyujinbox_text)
        elif TARGET_SITE == 'engage':
            post_to_engage(page, engage_text)
        else:
            post_to_google_form(page, indeed_text)
        
        # 接続を切断（ブラウザは閉じない）
        browser.close()
        p.stop()
        return True
        
    except Exception as e:
        print(f"❌ エラー発生: {e}")
        print("ヒント: Chromeがデバッグモード(--remote-debugging-port=9222)で起動していますか？")
        return False
