// 媒体の検出パターン
const SITE_PATTERNS = {
  indeed: {
    patterns: ['indeed.com'],
    name: 'Indeed',
    icon: '🔵'
  },
  kyujinbox: {
    patterns: ['xn--pckua2a7gp15o89zb.com', 'kyujinbox.com'],
    name: '求人ボックス',
    icon: '📦'
  },
  engage: {
    patterns: ['en-gage.net'],
    name: 'エンゲージ',
    icon: '💚'
  }
};

// Webアプリの URL（デプロイ後に更新）
const WEB_APP_URL = 'http://localhost:3000';

let currentSite = null;
let jobData = null;

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup: 初期化開始');
  
  await loadJobData();
  await detectCurrentSite();
  updateUI();
  
  // ボタンイベント
  document.getElementById('fillButton').addEventListener('click', handleFill);
  document.getElementById('openAppButton').addEventListener('click', () => {
    chrome.tabs.create({ url: WEB_APP_URL });
  });
  
  console.log('Popup: 初期化完了', { jobData, currentSite });
});

// Chrome拡張ストレージからデータ読み込み
async function loadJobData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['olp_job_data'], (result) => {
      console.log('Popup: ストレージからデータ読み込み', result);
      if (result.olp_job_data) {
        jobData = result.olp_job_data;
      }
      resolve();
    });
  });
}

// 現在のサイトを検出
async function detectCurrentSite() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Popup: 現在のタブ', tabs[0]?.url);
      
      if (tabs[0] && tabs[0].url) {
        const url = tabs[0].url;
        
        for (const [key, site] of Object.entries(SITE_PATTERNS)) {
          if (site.patterns.some(pattern => url.includes(pattern))) {
            currentSite = { key, ...site };
            console.log('Popup: サイト検出', currentSite);
            break;
          }
        }
      }
      resolve();
    });
  });
}

// UI更新
function updateUI() {
  const dataStatus = document.getElementById('dataStatus');
  const dataPreview = document.getElementById('dataPreview');
  const currentSiteEl = document.getElementById('currentSite');
  const fillButton = document.getElementById('fillButton');
  
  // データ状態
  if (jobData) {
    dataStatus.textContent = '✅ データあり';
    dataStatus.className = 'status-value has-data';
    dataPreview.style.display = 'block';
    
    // 会社名と職種を表示
    const companyName = jobData.masterData?.companyName || '-';
    const jobTitle = jobData.masterData?.jobTitle || '-';
    
    document.getElementById('indeedTitle').textContent = jobData.indeed?.jobTitle || jobTitle;
    document.getElementById('kyujinboxTitle').textContent = jobData.kyujinbox?.jobTitle || jobTitle;
    document.getElementById('engageTitle').textContent = jobData.engage?.jobTitle || jobTitle;
  } else {
    dataStatus.textContent = '❌ データなし（Webアプリで生成してください）';
    dataStatus.className = 'status-value no-data';
    dataPreview.style.display = 'none';
  }
  
  // 現在のサイト
  if (currentSite) {
    currentSiteEl.innerHTML = `${currentSite.icon} ${currentSite.name}を検出`;
    currentSiteEl.className = 'detected-site';
  } else {
    currentSiteEl.innerHTML = '⚠️ 対応サイトではありません';
    currentSiteEl.className = 'detected-site no-site';
  }
  
  // ボタン状態
  fillButton.disabled = !jobData || !currentSite;
}

// 自動入力実行
async function handleFill() {
  console.log('Popup: 自動入力開始');
  
  if (!jobData || !currentSite) {
    console.error('Popup: データまたはサイトがない');
    return;
  }
  
  // 媒体固有のデータとmasterDataを組み合わせる
  const mediaData = jobData[currentSite.key];
  const masterData = jobData.masterData;
  
  const dataToSend = {
    ...mediaData,
    masterData: masterData
  };
  
  console.log('Popup: 送信するデータ', dataToSend);
  
  if (!mediaData) {
    alert('このサイト用のデータがありません');
    return;
  }
  
  // 現在のタブを取得
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tabId = tabs[0].id;
    console.log('Popup: タブID', tabId);
    
    // まずcontent scriptをインジェクト（既に読み込まれていてもOK）
    try {
      const scriptFile = `content-${currentSite.key}.js`;
      console.log('Popup: スクリプトをインジェクト', scriptFile);
      
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [scriptFile]
      });
      
      console.log('Popup: スクリプトインジェクト完了');
      
      // 少し待ってからメッセージ送信
      setTimeout(() => {
        console.log('Popup: メッセージ送信');
        
        chrome.tabs.sendMessage(tabId, {
          action: 'fillForm',
          data: dataToSend
        }, (response) => {
          console.log('Popup: レスポンス', response);
          
          if (chrome.runtime.lastError) {
            console.error('Popup: エラー', chrome.runtime.lastError);
            alert('エラー: ' + chrome.runtime.lastError.message);
            return;
          }
          
          if (response && response.success) {
            const fillButton = document.getElementById('fillButton');
            fillButton.innerHTML = '<span>✅</span><span>入力完了！</span>';
            setTimeout(() => {
              fillButton.innerHTML = '<span>📝</span><span>フォームに自動入力</span>';
            }, 2000);
          } else {
            alert('入力に失敗しました。コンソールを確認してください。');
          }
        });
      }, 500);
      
    } catch (err) {
      console.error('Popup: スクリプトインジェクトエラー', err);
      alert('スクリプトの実行に失敗しました: ' + err.message);
    }
  });
}

// ストレージ変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.olp_job_data) {
    console.log('Popup: ストレージ変更検知', changes.olp_job_data);
    jobData = changes.olp_job_data.newValue;
    updateUI();
  }
});
