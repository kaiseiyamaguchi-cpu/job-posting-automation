// Indeed用 Content Script
console.log('OLP求人オートメーション: Indeed用スクリプト読み込み完了');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    console.log('Indeed: fillFormメッセージ受信', message.data);
    fillIndeedForm(message.data)
      .then(() => {
        console.log('Indeed: 入力成功');
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error('Indeed: 入力エラー', err);
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

async function fillIndeedForm(data) {
  console.log('=== Indeed フォーム入力開始 ===');
  console.log('受信データ:', data);
  
  let filledCount = 0;
  
  // 入力データの配列
  const dataToFill = [
    { value: data.jobDescription, label: '仕事内容' },
    { value: data.appealPoints, label: 'アピールポイント' },
    { value: data.targetPerson, label: '求める人材' },
    { value: data.requirements, label: '経験・スキル' },
    { value: data.benefits, label: '待遇・福利厚生' },
    { value: data.salary, label: '給与' },
    { value: data.workConditions, label: '勤務条件' },
    { value: data.other, label: 'その他' },
  ].map(item => ({
    value: toSafeString(item.value),  // 安全に文字列化
    label: item.label
  })).filter(item => item.value && item.value.trim());
  
  console.log('入力予定フィールド数:', dataToFill.length);
  
  // === デバッグ: ページ構造を分析 ===
  console.log('=== ページ構造分析 ===');
  
  // 1. contenteditable要素をチェック
  const editables = document.querySelectorAll('[contenteditable="true"]');
  console.log('contenteditable要素数:', editables.length);
  editables.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    console.log(`[${i}] contenteditable:`, {
      tag: el.tagName,
      class: el.className?.substring(0, 60),
      id: el.id,
      visible: rect.width > 0 && rect.height > 0,
      size: `${rect.width}x${rect.height}`,
    });
  });
  
  // 2. textarea要素をチェック
  const textareas = document.querySelectorAll('textarea');
  console.log('textarea要素数:', textareas.length);
  
  // 3. ARIA textbox
  const ariaTextboxes = document.querySelectorAll('[role="textbox"]');
  console.log('ARIA textbox要素数:', ariaTextboxes.length);
  
  // === 入力処理 ===
  console.log('=== 入力処理開始 ===');
  
  // 優先度1: ARIA textbox
  if (ariaTextboxes.length > 0) {
    console.log('ARIA textboxを検出:', ariaTextboxes.length);
    for (let i = 0; i < Math.min(ariaTextboxes.length, dataToFill.length); i++) {
      const el = ariaTextboxes[i];
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log(`✅ ARIA textbox[${i}] (${dataToFill[i].label}) に入力`);
        await fillRichEditor(el, dataToFill[i].value);
        filledCount++;
        await sleep(300);
      }
    }
  }
  
  // 優先度2: contenteditable（可視要素のみ）
  if (filledCount === 0) {
    const visibleEditables = Array.from(editables).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 50 && rect.height > 20; // 小さすぎる要素は除外
    });
    
    console.log('可視contenteditable:', visibleEditables.length);
    
    for (let i = 0; i < Math.min(visibleEditables.length, dataToFill.length); i++) {
      console.log(`✅ contenteditable[${i}] (${dataToFill[i].label}) に入力`);
      await fillRichEditor(visibleEditables[i], dataToFill[i].value);
      filledCount++;
      await sleep(300);
    }
  }
  
  // 優先度3: textarea
  if (filledCount === 0 && textareas.length > 0) {
    console.log('textareaに入力');
    for (let i = 0; i < Math.min(textareas.length, dataToFill.length); i++) {
      console.log(`✅ textarea[${i}] に入力`);
      await fillTextInput(textareas[i], dataToFill[i].value);
      filledCount++;
      await sleep(300);
    }
  }
  
  console.log(`=== 入力完了: ${filledCount}フィールド ===`);
  
  if (filledCount === 0) {
    console.error('❌ 入力可能なフィールドが見つかりませんでした');
    console.log('ヒント: Indeedの投稿フォームが完全に読み込まれているか確認してください。');
    console.log('ヒント: 「仕事内容」などの入力欄が表示されているページで実行してください。');
    throw new Error('入力可能なフィールドが見つかりませんでした');
  }
}

async function fillRichEditor(element, text) {
  console.log('  fillRichEditor開始');
  
  // スクロールして表示
  element.scrollIntoView({ behavior: 'instant', block: 'center' });
  await sleep(100);
  
  element.focus();
  await sleep(100);
  
  // 既存コンテンツをクリア
  element.innerHTML = '';
  await sleep(50);
  
  // 方法1: execCommand (最優先)
  const success = document.execCommand('insertText', false, text);
  if (success) {
    console.log('  execCommand成功');
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  
  // 方法2: テキストを段落として追加
  console.log('  innerHTML使用');
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    element.innerHTML = `<p>${text}</p>`;
  } else {
    element.innerHTML = lines.map(line => `<p>${line}</p>`).join('');
  }
  
  // イベント発火
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
  
  // キーボードイベント
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  
  await sleep(100);
  console.log('  fillRichEditor完了');
}

async function fillTextInput(element, value) {
  element.focus();
  await sleep(50);
  
  element.select();
  await sleep(50);
  
  const success = document.execCommand('insertText', false, value);
  if (success) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  
  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )?.set;
  
  if (nativeSetter) {
    nativeSetter.call(element, value);
  } else {
    element.value = value;
  }
  
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
