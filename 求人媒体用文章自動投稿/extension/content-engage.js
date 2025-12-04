// エンゲージ用 Content Script
console.log('OLP求人オートメーション: エンゲージ用スクリプト読み込み完了');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    console.log('エンゲージ: fillFormメッセージ受信', message.data);
    fillEngageForm(message.data)
      .then(() => {
        console.log('エンゲージ: 入力成功');
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error('エンゲージ: 入力エラー', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});

// 値を安全に文字列化
function toSafeString(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

async function fillEngageForm(data) {
  console.log('=== エンゲージ フォーム入力開始 ===');
  console.log('受信データ:', data);
  
  let filledCount = 0;
  const master = data.masterData || {};
  
  // フィールドマッピング
  const fieldMappings = [
    // 職種関連
    { name: 'official_occupation_name', value: data.jobTitle || master.jobTitle, label: '職種' },
    { name: 'occupation_name', value: data.jobTitle || master.jobTitle, label: '表示職種名' },
    
    // 会社情報
    { name: 'official_corporate_name', value: master.companyName, label: '会社名' },
    { name: 'business_content', value: master.businessDescription, label: '事業内容' },
    
    // 仕事内容
    { name: 'work_contents', value: data.jobDescription, label: '仕事内容' },
    
    // 勤務地
    { name: 'work_office_name[0]', value: master.companyName, label: '勤務先名' },
    { name: 'municipalities[0]', value: master.location, label: '市区町村' },
    { name: 'other_address[0]', value: master.location, label: 'その他住所' },
    { name: 'work_office_station[0]', value: master.nearestStation, label: '最寄り駅' },
    { name: 'access', value: master.nearestStation, label: 'アクセス' },
    { name: 'work_location', value: master.location, label: '勤務地備考' },
    
    // 給与
    { name: 'salary_note', value: data.salary, label: '給与備考' },
    
    // 勤務条件
    { name: 'office_hours', value: data.workConditions || master.workHours, label: '勤務時間' },
    { name: 'annual_holiday', value: master.holidays?.match(/\d+/)?.[0] || '', label: '年間休日' },
    { name: 'holiday', value: master.holidays, label: '休日・休暇' },
    
    // 応募条件
    { name: 'qualification', value: data.targetPerson, label: '応募資格' },
    
    // その他
    { name: 'recruitment_bg', value: data.appealPoints, label: '募集背景' },
    { name: 'treatment', value: data.benefits, label: '待遇・福利厚生' },
  ];
  
  for (const field of fieldMappings) {
    // 値を安全に文字列化
    const stringValue = toSafeString(field.value);
    
    if (!stringValue || !stringValue.trim()) {
      console.log(`⏭️ ${field.label}: 値が空のためスキップ`);
      continue;
    }
    
    // 要素を検索
    const selector = `input[name="${field.name}"], textarea[name="${field.name}"], select[name="${field.name}"]`;
    const elements = document.querySelectorAll(selector);
    console.log(`🔍 ${field.label} (name="${field.name}"): ${elements.length}件見つかりました`);
    
    let targetElement = null;
    
    for (const el of elements) {
      const type = el.type || '';
      // checkbox/radio/hidden/file/submit/passwordはスキップ
      if (['checkbox', 'radio', 'hidden', 'file', 'submit', 'password'].includes(type)) {
        continue;
      }
      
      // 可視性チェック
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const style = window.getComputedStyle(el);
      const isDisplayed = style.display !== 'none' && style.visibility !== 'hidden';
      
      // 親要素の可視性もチェック
      let parent = el.parentElement;
      let parentVisible = true;
      while (parent && parentVisible) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
          parentVisible = false;
        }
        parent = parent.parentElement;
      }
      
      console.log(`  - 要素: ${el.tagName}, visible=${isVisible}, displayed=${isDisplayed}, parentVisible=${parentVisible}`);
      
      if (isVisible && isDisplayed && parentVisible) {
        targetElement = el;
        break;
      }
    }
    
    if (targetElement) {
      console.log(`✅ ${field.label} に入力開始...`);
      const success = await fillInputAdvanced(targetElement, stringValue);
      if (success) {
        filledCount++;
        console.log(`✅ ${field.label} 入力完了`);
      } else {
        console.log(`❌ ${field.label} 入力失敗`);
      }
      await sleep(300);
    } else {
      console.log(`⚠️ ${field.label}: 可視要素が見つかりません`);
    }
  }
  
  console.log(`=== 入力完了: ${filledCount}フィールド ===`);
  
  if (filledCount === 0) {
    throw new Error('入力可能なフィールドが見つかりませんでした');
  }
}

// 改善された入力関数
async function fillInputAdvanced(element, value) {
  try {
    // スクロールして要素を表示
    element.scrollIntoView({ behavior: 'instant', block: 'center' });
    await sleep(100);
    
    element.focus();
    await sleep(100);
    
    const tagName = element.tagName.toUpperCase();
    
    // 既存の値をクリア
    if (tagName === 'TEXTAREA' || (tagName === 'INPUT' && element.type === 'text')) {
      element.select();
      await sleep(50);
    }
    
    // 方法1: execCommand (最も確実)
    const success1 = document.execCommand('insertText', false, value);
    if (success1 && element.value === value) {
      console.log('  execCommand成功');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    
    // 方法2: nativeInputValueSetter (React対応)
    const nativeSetter = Object.getOwnPropertyDescriptor(
      tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value'
    )?.set;
    
    if (nativeSetter) {
      nativeSetter.call(element, value);
      console.log('  nativeSetter使用');
    } else {
      element.value = value;
      console.log('  直接代入');
    }
    
    // イベント発火（React/Vue対応）
    element.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: value
    }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    
    await sleep(100);
    
    // 値が正しく設定されたか確認
    const actualValue = element.value;
    if (actualValue === value) {
      console.log('  値の設定を確認OK');
      return true;
    } else {
      console.log(`  値の不一致: expected="${value.substring(0,30)}...", actual="${actualValue.substring(0,30)}..."`);
      return false;
    }
    
  } catch (err) {
    console.error('入力エラー:', err);
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
