// 求人ボックス用 Content Script
console.log('OLP求人オートメーション: 求人ボックス用スクリプト読み込み完了');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    console.log('求人ボックス: fillFormメッセージ受信', message.data);
    fillKyujinboxForm(message.data)
      .then(() => {
        console.log('求人ボックス: 入力成功');
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error('求人ボックス: 入力エラー', err);
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

async function fillKyujinboxForm(data) {
  console.log('=== 求人ボックス フォーム入力開始 ===');
  console.log('受信データ:', data);
  
  let filledCount = 0;
  const master = data.masterData || {};
  
  // name属性で直接マッピング
  const fieldMappings = [
    { name: 'company', value: master.companyName, label: '会社名' },
    { name: 'title', value: data.jobTitle || master.jobTitle, label: '求人タイトル' },
    { name: 'description', value: data.jobDescription, label: '仕事内容' },
    { name: 'rewarding', value: data.appealPoints, label: 'やりがい' },
    { name: 'qualifications', value: data.targetPerson, label: '対象となる方' },
    { name: 'address', value: master.location, label: '住所' },
    { name: 'transportation', value: master.nearestStation, label: '交通手段' },
    { name: 'payMin', value: master.salaryMin, label: '最低給与' },
    { name: 'payMax', value: master.salaryMax, label: '最高給与' },
    { name: 'benefit', value: data.benefits || data.salary, label: '給与詳細' },
    { name: 'worktimeHoliday', value: data.workConditions, label: '勤務時間・休日' },
    { name: 'howToApply', value: data.other, label: '応募方法' },
  ];
  
  for (const field of fieldMappings) {
    // 値を安全に文字列化
    const stringValue = toSafeString(field.value);
    
    if (!stringValue || !stringValue.trim()) {
      console.log(`⏭️ ${field.label}: 値が空のためスキップ`);
      continue;
    }
    
    // 要素を検索（可視性もチェック）
    const elements = document.querySelectorAll(`[name="${field.name}"]`);
    console.log(`🔍 ${field.label} (name="${field.name}"): ${elements.length}件見つかりました`);
    
    let targetElement = null;
    
    for (const el of elements) {
      const type = el.type || '';
      // checkbox/radio/hidden/file/submitはスキップ
      if (['checkbox', 'radio', 'hidden', 'file', 'submit'].includes(type)) {
        continue;
      }
      
      // 可視性チェック
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const style = window.getComputedStyle(el);
      const isDisplayed = style.display !== 'none' && style.visibility !== 'hidden';
      
      console.log(`  - 要素: ${el.tagName}, visible=${isVisible}, displayed=${isDisplayed}`);
      
      if (isVisible && isDisplayed) {
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
    if (success1) {
      console.log('  execCommand成功');
      await sleep(50);
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
    
    await sleep(50);
    
    // 値が正しく設定されたか確認
    if (element.value === value) {
      console.log('  値の設定を確認');
      return true;
    } else {
      console.log(`  値の不一致: expected="${value.substring(0,20)}...", actual="${element.value.substring(0,20)}..."`);
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
