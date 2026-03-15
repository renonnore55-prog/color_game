/**
 *
 * - game.js — カラーバトル ゲームロジック
 * -
 * - 構成:
 * - 1. 定数（お題リスト）
 * - 1. ゲーム状態（state）
 * - 1. 画面切り替え
 * - 1. セットアップフェーズ
 * - 1. ターン開始
 * - 1. 色作りフェーズ
 * - 1. ランキングフェーズ
 * - 1. ドラッグソート
 * - 1. スコア計算・結果表示
 * - 1. 最終結果・リセット
 * - 1. エフェクト（紙吹雪）
 */

/* ============================================================
1. 定数 — お題リスト
============================================================ */
const TOPICS = [
  '夏っぽい色',   '美味しそうな色', '海の色',      '怒ってる色',    '眠そうな色',
  '幸せな色',     '怖い色',         '春っぽい色',  '宇宙っぽい色',  'お金持ちっぽい色',
  '子供っぽい色', '大人っぽい色',   '悲しい色',    '恋している色',  '未来っぽい色',
  '嬉しい色',     '懐かしい色',     '冬っぽい色',      '秋っぽい色',  '朝の色',
  '夜の色',       '深海の色',       '森の色',       '砂漠の色',      '雷の色',
  '甘い色',       '春っぽい色',         '冷たい色',     '温かい色',      'パーティーの色',
  '眩しい色',     '静かな色',       '激しい色',    '柔らかい色',    '硬い色',
  '汚い色',     '気持ちの悪い色',       'うざい色',    '臭そうな色',  'セクシーな色',
  '好きな乳首の色',     '好みの異性の髪の色',   '妖絶な色',    '青春の色',  '深い色',
  '合宿所の湯舟',     'あのころの青色',   '食欲が無くなる色',    '食欲が湧く色',  'うんこの色',
  'ビート版',     '中二病',   '紙ファイル',    'LINE',  'コカ・コーラ',
  '地上最強',     '戦国',   '不良の髪の色',    'ハチミツ',  '溶岩',
  '虫歯',     '平安時代',   'gkbr',    '食欲が湧く色',  '氷河期',
  '乳輪',     '稲妻',   'チョコレート',    'イチゴ味の○○',  'ホコリ',
  'ピラミッド',     '曇天',   '老人の髪の毛',    '吉野家',  'ホチキス',
  'ホクロの色',     '青空',   'スク水',    '草原',  '香水',
];

/* ============================================================
2. ゲーム状態（state）
すべての動的データをここで一元管理する
============================================================ */
let state = {
  players: [],          // { name: string, score: number }[]
  cycleCount: 2,        // 総サイクル数
  currentCycle: 1,      // 現在のサイクル番号

  currentRankerIdx: 0,  // ランキング担当プレイヤーの index
  makerOrder: [],       // 色作りプレイヤーの index 配列
  currentMakerPos: 0,   // makerOrder 内の現在位置

  topic: '',            // 今ラウンドのお題
  madeColors: [],       // { playerIdx, r, g, b }[] — 作られた色の配列

  /** ランキング確定後の順位配列（madeColors の index を1位から並べたもの） */
  rankingOrder: [],

  timerInterval: null,  // setInterval の ID
  timerRemaining: 20,   // タイマー残り秒数

  totalTurns: 0,        // ゲーム全体のターン総数（players.length × cycleCount）
  completedTurns: 0,    // 完了済みターン数
};

/* ============================================================
3. 画面切り替え
============================================================ */

/**
 * - 指定した id の画面を表示し、他を非表示にする
 * - @param {string} screenId - 表示する画面の id
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  window.scrollTo(0, 0);
}

/**
 * - ステータスバー用 HTML を生成する（サイクル数・ターン数）
 * - @returns {string} HTML文字列
 */
function buildStatusHTML() {
  const turn  = state.completedTurns + 1;
  const total = state.totalTurns;
  return `<span class="pill">サイクル ${state.currentCycle}/${state.cycleCount}</span> <span class="pill">ターン ${turn}/${total}</span>  `;
}

/* ============================================================
4. セットアップフェーズ
============================================================ */

/**
 * - セットアップ画面 → 名前入力画面へ進む
 * - プレイ人数・サイクル数のバリデーションも行う
 */
function goToNames() {
  const count  = parseInt(document.getElementById('player-count').value);
  const cycles = parseInt(document.getElementById('cycle-count').value);

  if (isNaN(count) || count < 3) {
    alert('プレイ人数は3人以上にしてください');
    return;
  }
  if (isNaN(cycles) || cycles < 1) {
    alert('サイクル数は1以上にしてください');
    return;
  }

  state.cycleCount = cycles;

  // 名前入力欄を動的に生成
  const container = document.getElementById('name-inputs');
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `<span class="player-num">${i + 1}</span> <input type="text" value="プレイヤー${i + 1}" placeholder="プレイヤー${i + 1}" id="pname-${i}">`;
    container.appendChild(row);
  }

  // state に仮プレイヤーを設定（startGame で上書き）
  state.players = Array.from({ length: count }, (_, i) => ({
    name: `プレイヤー${i + 1}`,
    score: 0,
  }));

  showScreen('screen-names');
}
//戻るボタン
function backToSetup() {
  showScreen('screen-setup');
}
/**
 * - 名前を確定してゲームを開始する
 * - state を初期化し、最初のターンを開始する
 */
function startGame() {
  const count = state.players.length;

  for (let i = 0; i < count; i++) {
    const val = document.getElementById(`pname-${i}`).value.trim();
    state.players[i].name  = val || `プレイヤー${i + 1}`;
    state.players[i].score = 0;
  }

  state.currentCycle     = 1;
  state.currentRankerIdx = 0;
  state.totalTurns       = count * state.cycleCount;
  state.completedTurns   = 0;

  startTurn();
}

/* ============================================================
5. ターン開始
============================================================ */

/**
 * - 新しいターンを開始する
 * - ランキング担当・お題を決定し、ラウンドイントロ画面を表示する
 */
function startTurn() {
  const rankerIdx = state.currentRankerIdx;

  // 色作りプレイヤー = ランキング担当以外の全員
  state.makerOrder      = state.players.map((_, i) => i).filter(i => i !== rankerIdx);
  state.currentMakerPos = 0;
  state.madeColors      = [];
  state.topic           = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  document.getElementById('intro-status').innerHTML        = buildStatusHTML();
  document.getElementById('intro-ranker-name').textContent = state.players[rankerIdx].name;
  document.getElementById('intro-topic').textContent       = state.topic;

  showScreen('screen-round-intro');
}

/* ============================================================
6. 色作りフェーズ
============================================================ */

/**
 * - 色作りフェーズを開始する（最初のプレイヤーへのパス画面を表示）
 */
function startMakingPhase() {
  passToNextMaker();
}

/**
 * - 現在の色作りプレイヤーへスマホを渡す画面を表示する
 */
function passToNextMaker() {
  const makerIdx = state.makerOrder[state.currentMakerPos];
  document.getElementById('pass-maker-name').textContent = state.players[makerIdx].name;
  showScreen('screen-pass-to-maker');
}

/**
 * - 色作りタイマーと操作UIを開始する
 * - スライダーをランダム値で初期化し、20秒のカウントダウンを開始する
 */
function startMakerTimer() {
  // ステータスバーを更新
  document.getElementById('make-status').innerHTML =
    buildStatusHTML() +
    `<span class="pill">${state.currentMakerPos + 1}/${state.makerOrder.length}人目</span>`;

  document.getElementById('make-topic').textContent = state.topic;

  // スライダーをランダム値で初期化
  document.getElementById('r-slider').value = Math.floor(Math.random() * 256);
  document.getElementById('g-slider').value = Math.floor(Math.random() * 256);
  document.getElementById('b-slider').value = Math.floor(Math.random() * 256);
  updateColor();

  // タイマーを開始
  clearInterval(state.timerInterval);
  state.timerRemaining = 20;
  updateTimerUI(20);

  state.timerInterval = setInterval(() => {
    state.timerRemaining--;
    updateTimerUI(state.timerRemaining);

    if (state.timerRemaining <= 0) {
      clearInterval(state.timerInterval);
      submitColor(); // 時間切れでも現在の色を自動保存
    }
  }, 1000);

  showScreen('screen-make-color');
}

/**
 * - RGBスライダーの値をカラープレビューと数値表示に反映する
 * - input[oninput] から呼ばれる
 */
function updateColor() {
  const r = parseInt(document.getElementById('r-slider').value);
  const g = parseInt(document.getElementById('g-slider').value);
  const b = parseInt(document.getElementById('b-slider').value);

  document.getElementById('r-val').textContent = r;
  document.getElementById('g-val').textContent = g;
  document.getElementById('b-val').textContent = b;
  document.getElementById('color-preview').style.background = `rgb(${r},${g},${b})`;
}

/**
 * - タイマーのSVGリングと残り秒数テキストを更新する
 * - 残り秒数に応じて色も変化させる（緑 → 黄 → 赤）
 * - @param {number} t - 残り秒数
 */
function updateTimerUI(t) {
  const arc           = document.getElementById('timer-arc');
  const txt           = document.getElementById('timer-text');
  const circumference = 263.9; // 2π × r(42)
  const offset        = circumference * (1 - t / 20);

  arc.style.strokeDashoffset = offset;
  txt.textContent = t;

  // 残り時間に応じて色変更
  if (t <= 5) {
    arc.style.stroke = 'var(--accent)';  // 赤
    txt.style.fill   = 'var(--accent)';
  } else if (t <= 10) {
    arc.style.stroke = '#ffaa00';        // 黄
    txt.style.fill   = '#ffaa00';
  } else {
    arc.style.stroke = 'var(--accent3)'; // シアン（通常）
    txt.style.fill   = 'var(--text)';
  }
}

/**
 * - 現在のRGB値を色として保存し、色保存確認画面を表示する
 * - ボタン押下・タイマー切れ両方から呼ばれる
 */
function submitColor() {
  clearInterval(state.timerInterval);

  const r        = parseInt(document.getElementById('r-slider').value);
  const g        = parseInt(document.getElementById('g-slider').value);
  const b        = parseInt(document.getElementById('b-slider').value);
  const makerIdx = state.makerOrder[state.currentMakerPos];

  state.madeColors.push({ playerIdx: makerIdx, r, g, b });

  // 保存確認画面に色を反映
  document.getElementById('submitted-preview').style.background = `rgb(${r},${g},${b})`;
  document.getElementById('submitted-info').textContent =
    `${state.players[makerIdx].name} の色： RGB(${r}, ${g}, ${b})`;

  // 次のプレイヤー案内またはランキングへの誘導
  const isLastMaker = state.currentMakerPos >= state.makerOrder.length - 1;
  const nextInfoEl  = document.getElementById('submitted-next-info');

  if (isLastMaker) {
    nextInfoEl.innerHTML = `<span style="color:var(--accent3); font-weight:700">全員分完了！ランキングへ進みます</span>`;
  } else {
    const nextMakerIdx = state.makerOrder[state.currentMakerPos + 1];
    nextInfoEl.innerHTML = `次は <strong>${state.players[nextMakerIdx].name}</strong> へ渡してください`;
  }

  showScreen('screen-color-submitted');
}

/**
 * - 「次へ」ボタン処理
 * - まだ色を作っていないプレイヤーがいれば次のプレイヤーへ、
 * - 全員分完了ならランキングフェーズへ進む
 */
function nextMaker() {

  console.log("nextMaker called");
  console.log("currentMakerPos:", state.currentMakerPos);
  console.log("maker length:", state.makerOrder.length);

  const isLastMaker = state.currentMakerPos >= state.makerOrder.length - 1;

  console.log("isLastMaker:", isLastMaker);

  if (isLastMaker) {
    console.log("start ranking");
    startRankingPhase();
  } else {
    state.currentMakerPos++;
    passToNextMaker();
  }
}
/* ============================================================
7. ランキングフェーズ
============================================================ */

/**
 * - ランキング画面を初期化して表示する
 * - 色カードをシャッフルしてドラッグリストに追加する
 * - ドラッグ＆ドロップで順位を入れ替えられるようにする
 */
function startRankingPhase() {
  const rankerIdx = state.currentRankerIdx;

  document.getElementById('ranking-status').innerHTML =
    buildStatusHTML();

  document.getElementById('ranking-ranker-name').textContent =
    state.players[rankerIdx].name;

  document.getElementById('ranking-topic').textContent =
    state.topic;

  // 色カードをシャッフル（作成順がバレないように）
  const shuffled = [...state.madeColors];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const list = document.getElementById('draggable-colors');
  list.innerHTML = '';
const template = document.getElementById('ranking-card-template');

shuffled.forEach((colorData, index) => {
  const originalIdx = state.madeColors.indexOf(colorData);
  const rgb = `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`;

  const item = template.content.firstElementChild.cloneNode(true);

  item.dataset.colorIdx = originalIdx;
  item.draggable = true;
  item.querySelector('.rank-number').textContent = index + 1;
  item.querySelector('.ranking-title').textContent = `色 ${index + 1}`;
  item.querySelector('.ranking-rgb').textContent =
    `RGB(${colorData.r}, ${colorData.g}, ${colorData.b})`;
  item.querySelector('.color-card').style.background = rgb;

  addDragEvents(item);
  list.appendChild(item);
});
  updateRankingNumbers();
  showScreen('screen-ranking');
}

/**
 * - ランキング確定
 * - 現在の並び順を state.rankingOrder に保存して結果画面へ進む
 */
function confirmRanking() {
  const items = document.querySelectorAll('#draggable-colors .draggable-item');

  state.rankingOrder = [];

  items.forEach(item => {
    const idx = parseInt(item.dataset.colorIdx, 10);
    state.rankingOrder.push(idx);
  });

  showRoundResult();
}

/* ============================================================
8. ドラッグソート
============================================================ */

let draggedItem = null;

/**
 * - 各ランキングカードにドラッグイベントを付与する
 * - @param {HTMLElement} item
 */
function addDragEvents(item) {
  item.addEventListener('dragstart', () => {
    draggedItem = item;
    item.classList.add('dragging');
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    draggedItem = null;
    updateRankingNumbers();
  });

  item.addEventListener('dragover', e => {
    e.preventDefault();
  });

  item.addEventListener('drop', e => {
    e.preventDefault();

    if (!draggedItem || draggedItem === item) return;

    const list = document.getElementById('draggable-colors');
    const items = [...list.querySelectorAll('.draggable-item')];
    const draggedIndex = items.indexOf(draggedItem);
    const targetIndex = items.indexOf(item);

    if (draggedIndex < targetIndex) {
      list.insertBefore(draggedItem, item.nextSibling);
    } else {
      list.insertBefore(draggedItem, item);
    }

    updateRankingNumbers();
  });
}

/**
 * - 並び替え後に左側の順位番号を振り直す
 */
function updateRankingNumbers() {
  const items = document.querySelectorAll('#draggable-colors .draggable-item');

  items.forEach((item, index) => {
    const numEl = item.querySelector('.rank-number');
    const titleEl = item.querySelector('div[style*="font-weight:700; font-size:1rem;"]');

    if (numEl) {
      numEl.textContent = index + 1;
    }

    if (titleEl) {
      titleEl.textContent = `色 ${index + 1}`;
    }
  });
}

function confirmRanking() {
  const items = document.querySelectorAll('#draggable-colors .draggable-item');
  state.rankingOrder = [];

  items.forEach(item => {
    state.rankingOrder.push(parseInt(item.dataset.colorIdx));
  });

  showRoundResult();
}

//結果発表
function showRoundResult() {

  document.getElementById("result-status").innerHTML = buildStatusHTML();

  const list = document.getElementById("round-result-list");
  list.innerHTML = "";

  const makerCount = state.makerOrder.length;

  state.rankingOrder.forEach((colorIdx, rank) => {

    const color = state.madeColors[colorIdx];
    const player = state.players[color.playerIdx];

    const points = makerCount - rank;
    player.score += points;

    const rgb = `rgb(${color.r},${color.g},${color.b})`;

    const row = document.createElement("div");
    row.className = "result-row";

    row.innerHTML = `
      <div>${rank+1}位</div>
      <div style="width:40px;height:40px;border-radius:8px;background:${rgb}"></div>
      <div>${player.name}</div>
      <div>+${points}pt</div>
    `;

    list.appendChild(row);
  });

  updateScoreBoard();

  showScreen("screen-round-result");
}

function updateScoreBoard(){

  const list = document.getElementById("current-scores");
  list.innerHTML = "";

  const sorted = [...state.players].sort((a,b)=>b.score-a.score);

  sorted.forEach(p=>{

    const row = document.createElement("div");

    row.innerHTML = `
      <div>${p.name}</div>
      <div>${p.score}pt</div>
    `;

    list.appendChild(row);

  });
}

function nextRound(){

  state.completedTurns++;

  const playerCount = state.players.length;

  state.currentRankerIdx++;

  if(state.currentRankerIdx >= playerCount){

    state.currentRankerIdx = 0;
    state.currentCycle++;
  }

  if(state.currentCycle > state.cycleCount){

    showFinalResult();
    return;
  }

  startTurn();
}

function showFinalResult(){

  const sorted = [...state.players].sort((a,b)=>b.score-a.score);

  const winner = sorted[0];

  document.getElementById("winner-name").textContent = winner.name;

  const list = document.getElementById("final-scores");
  list.innerHTML = "";

  sorted.forEach((p,i)=>{

    const row = document.createElement("div");

    row.innerHTML = `
      <div>${i+1}位</div>
      <div>${p.name}</div>
      <div>${p.score}pt</div>
    `;

    list.appendChild(row);

  });

  showScreen("screen-final");
}

function resetGame(){

  state.players.forEach(p=>p.score=0);

  state.currentCycle = 1;
  state.currentRankerIdx = 0;
  state.completedTurns = 0;

  showScreen("screen-setup");
}