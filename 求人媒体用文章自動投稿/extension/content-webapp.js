// Webアプリ連携用 Content Script
console.log('OLP求人オートメーション: Webアプリ連携スクリプト読み込み完了');

// LocalStorageの変更を監視
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  
  if (key === 'olp_job_data') {
    console.log('Webアプリから求人データを受信:', value);
    
    // Chrome拡張のストレージに保存
    try {
      const data = JSON.parse(value);
      chrome.storage.local.set({ olp_job_data: data }, () => {
        console.log('Chrome拡張ストレージに保存完了');
        
        // 保存完了を通知
        window.postMessage({
          type: 'OLP_DATA_SAVED',
          success: true
        }, '*');
      });
    } catch (e) {
      console.error('データ保存エラー:', e);
    }
  }
};

// 初回読み込み時に既存データをチェック
const existingData = localStorage.getItem('olp_job_data');
if (existingData) {
  try {
    const data = JSON.parse(existingData);
    chrome.storage.local.set({ olp_job_data: data }, () => {
      console.log('既存データをChrome拡張に同期');
    });
  } catch (e) {
    console.error('既存データの同期エラー:', e);
  }
}

// ページにChrome拡張がインストール済みであることを通知
window.postMessage({
  type: 'OLP_EXTENSION_READY',
  version: '1.0.0'
}, '*');

