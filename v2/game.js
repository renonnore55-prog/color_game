/**
 * game.js — カラーバトル ゲームロジック
 *
 * 構成:
 * 1. 定数（お題リスト）
 * 2. ゲーム状態（state）
 * 3. 画面切り替え
 * 4. セットアップフェーズ
 * 5. ターン開始
 * 6. 色作りフェーズ
 * 7. ランキングフェーズ
 * 8. ドラッグソート
 * 9. スコア計算・結果表示
 * 10. 最終結果・リセット
 * 11. HSL→RGB変換
 * 12. ログ出力
 */

/* ============================================================
1. 定数 — お題リスト
============================================================ */
const TOPICS = [
  // 1. 【情緒・感情】人間の感性を学習する
  "初恋", "嫉妬", "孤独", "信頼", "郷愁（ノスタルジー）", "絶望", "歓喜", "焦燥感", "慈愛", "劣等感",
  "期待感", "倦怠期", "深い眠り", "静かな怒り", "ほのかな嘘", "勇気", "憂鬱な月曜日", "解放感", "秘密の共有", "恥じらい",
  "虚無感", "ぬくもり", "切なさ", "復讐心", "穏やかな老後", "未知への恐怖", "親愛", "執着", "潔白", "罪悪感",
  "幸福の絶頂", "疑念", "諦め", "青春の終わり", "慈悲", "自信", "恍惚", "退屈", "好奇心", "戸惑い",
  "憧れ", "哀悼", "忍耐", "打算的な愛", "幼少期の記憶", "誇り", "羞恥心", "平常心", "欲望", "感謝",

  // 2. 【自然・気象】環境光と質感を学習する
  "雨上がりの空", "嵐の前の静けさ", "真夏の陽炎", "霧の立ち込める森", "凍りついた湖", "深海10,000メートル", "砂漠の黄昏", "溶岩の熱", "苔むした岩", "枯れ葉の山",
  "初雪", "乱雲", "熱帯夜", "夜明け前の水平線", "木漏れ日", "満月の夜空", "干上がった大地", "湿った土", "熟した果実", "珊瑚礁の浅瀬",
  "彗星の尾", "稲妻", "灼熱の太陽", "秋の長雨", "春の訪れ", "猛吹雪", "鍾乳洞の奥", "落陽", "薄氷", "荒れ狂う海",
  "森林浴", "銀世界", "焼けつく砂", "朝露", "竜巻の中", "満開の夜桜", "濁流", "白夜", "極光（オーロラ）", "砂嵐",
  "蛍の光", "岩肌の影", "潮だまり", "噴火口", "氷河の裂け目", "秋晴れ", "宵闇", "陽光", "密林の闇", "無風状態",

  // 3. 【物質・工芸】質感と劣化を学習する
  "錆びついた鉄くず", "磨き抜かれた真鍮", "10年前の革靴", "色あせたデニム", "煤けた煙突", "濡れたアスファルト", "焼き立ての陶器", "古びた羊皮紙", "絹の光沢", "黒曜石",
  "劣化したゴム", "すりガラス", "錆びた銅像", "焼成された煉瓦", "高級なビロード", "使い込まれた麻布", "湿ったコンクリート", "砕けた大理石", "油膜の浮いた水たまり", "乾いた粘土",
  "錫（スズ）の鈍い輝き", "煤（すす）", "翡翠（ヒスイ）", "焦げた木材", "真珠の輝き", "歪んだプラスチック", "古い映画のフィルム", "銀のスプーン", "琥珀の中の虫", "廃墟の壁紙",
  "サテンのドレス", "砂利道", "石灰岩", "サビの浮いた自転車", "羊毛のセーター", "削りたての鉛筆", "漆塗りの器", "曇った鏡", "ソーダガラス", "帆布",
  "セメント", "獣の毛皮", "竹林の影", "紙ヤスリ", "蛍光灯の青白さ", "焚き火の灰", "蝋燭の炎", "炭", "古銭", "錆びた鎖", "磨かれた大理石", "朽ちた木のベンチ", "ビニール傘",
  "古いレコード盤", "目立つ色", "体毛(アジア系男性)", "体毛(アフリカ系男性)", "体毛(ヨーロッパ系男性)", "肌の色(アジア系男性)", "肌の色(アフリカ系男性)", "肌の色(ヨーロッパ系男性)", "髪の色(アジア系男性)", "髪の色(アフリカ系男性)", "髪の色(ヨーロッパ系男性)",

  // 4. 【食べ物・文化】味覚と香りを色に変換する
  "焦がしキャラメル", "淹れたてのブラックコーヒー", "熟成されたワイン", "激辛スパイス", "採れたての蜂蜜", "焼きたてのトースト", "腐敗したリンゴ", "宇治抹茶", "ビールの泡", "醤油のコク",
  "絞りたてのレモン", "とろけるバター", "燻製肉", "いちごミルク", "乾燥したハーブ", "ビターチョコレート", "ぬるいラムネ", "獲れたてのサバ", "赤ワインの澱（おり）", "完熟マンゴー",
  "炭酸水", "蒸し立ての中華まん", "漢方薬", "煮込みすぎたカレー", "冷えたシャンパン", "杏仁豆腐", "焼き芋", "練り梅", "焙じ茶", "ブルーチーズ",
  "チョコバナナ", "オリーブオイル", "黒蜜", "飴細工", "焼肉のタレ", "メロンソーダ", "シナモンパウダー", "バルサミコ酢", "トリュフ", "焼きたてのクッキー",
  "ジンジャーエール", "ココア", "牛乳", "紅茶の茶葉", "ざらめ", "水ようかん", "グレープフルーツ", "ミントティー", "赤飯", "しなびたレタス",

  // 5. 【時間・空間】空気感を数値化する
  "午後4時の教室", "深夜のサービスエリア", "始発列車のホーム", "無人の遊園地", "1980年代の裏通り", "未知の惑星の地表", "病院の待合室", "ライブハウスの熱気", "図書館の隅", "夕暮れの国道",
  "祭りのあとの静寂", "工場の夜景", "ログハウスの暖炉", "雨の日のバス停", "サイバーパンクなスラム街", "古い教会のステンドグラス", "土曜日の昼下がり", "地下駐車場の蛍光灯", "朝霧の港", "放課後の音楽室",
  "高速道路のトンネル", "真冬のサンルーム", "屋台の赤提灯", "エレベーターの中", "廃ビルの階段", "秘密基地", "深夜のコンビニ", "真っ暗なシアター", "夏休みの校庭", "潮風の香る町",
  "神社の境内", "都会の喧騒", "霧のロンドン", "オフィスの無機質さ", "子供部屋", "押し入れの奥", "露天風呂", "展示会場", "屋上から見る夜景", "洗面所の朝",
  "バーのカウンター", "通学路", "旅先のホテルの窓", "満員電車", "公園のベンチ", "静まり返った住宅街", "月面基地", "水族館のトンネル", "遺跡の入り口", "記憶の中の景色",

  // 6. 【概念・アート】抽象を色彩に固定する
  "秩序", "混沌", "エレガンス", "ミニマリズム", "レトロフューチャー", "暴力性", "清潔感", "神秘", "クラシック", "スピード感",
  "永遠", "刹那", "毒", "透明感", "重厚感", "虚飾", "無垢", "退廃（デカダンス）", "繁栄", "没落",
  "知性", "野生", "デジタル", "アナログ", "夢幻", "真実", "嘘", "バランス", "リズム", "沈黙",
  "喧騒", "伝統", "革新", "安らぎ", "緊張", "調和", "摩擦", "エゴ", "無私の心", "ロマンチシズム",
  "個性的", "常識的", "潔癖", "リアリズム", "狂気", "正気", "幽玄", "わび・さび", "モダン", "ノイズ", "ピュア", "禁断", "運命",

  // 7. 【その他】自由に連想してもらうための予備軍
  "高級感のある青","高級感のある赤","高級感のある緑","高級感のある黄","高級感のある紫","高級感のある橙","高級感のある桃","高級感のある青緑","高級感のある茶色","高級感のある灰色",
  "安っぽい青","安っぽい赤","安っぽい緑","安っぽい黄","安っぽい紫","安っぽい橙","安っぽい桃","安っぽい青緑","安っぽい茶色","安っぽい灰色",
];

const TOPICS_ENG = [
  // 1. 【情緒・感情】人間の感性を学習する (Emotions & Feelings)
  "First Love", "Jealousy", "Loneliness", "Trust", "Nostalgia", "Despair", "Joy", "Irritation", "Affection", "Inferiority Complex",
  "Expectation", "Ennui", "Deep Sleep", "Quiet Anger", "Subtle Lie", "Courage", "Blue Monday", "Sense of Liberation", "Shared Secret", "Bashfulness",
  "Emptiness", "Warmth", "Bittersweetness", "Revengefulness", "Peaceful Old Age", "Fear of the Unknown", "Dearness", "Attachment", "Innocence", "Guilt",
  "Peak of Happiness", "Suspicion", "Resignation", "End of Youth", "Mercy", "Self-confidence", "Ecstasy", "Boredom", "Curiosity", "Bewilderment",
  "Yearning", "Mourning", "Patience", "Calculating Love", "Childhood Memories", "Pride", "Sense of Shame", "Presence of Mind", "Desire", "Gratitude",

  // 2. 【自然・気象】環境光と質感を学習する (Nature & Weather)
  "Sky After Rain", "Calm Before the Storm", "Summer Heat Haze", "Mist-shrouded Forest", "Frozen Lake", "Deep Sea 10,000m", "Twilight in the Desert", "Heat of Lava", "Moss-covered Rock", "Pile of Dead Leaves",
  "First Snow", "Turbulent Clouds", "Sultry Night", "Horizon Before Dawn", "Komorebi (Sunlight through trees)", "Full Moon Night Sky", "Parched Earth", "Moist Soil", "Ripe Fruit", "Shallow Coral Reef",
  "Comet Tail", "Lightning", "Scorching Sun", "Autumn Long Rain", "Arrival of Spring", "Blizzard", "Deep in a Limestone Cave", "Setting Sun", "Thin Ice", "Raging Sea",
  "Forest Bathing", "Silver World", "Burning Sand", "Morning Dew", "Inside a Tornado", "Night Cherry Blossoms in Full Bloom", "Muddy Stream", "Midnight Sun", "Aurora (Northern Lights)", "Sandstorm",
  "Firefly Light", "Shadow of a Rock Face", "Tide Pool", "Crater", "Glacial Crevasse", "Clear Autumn Sky", "Dusk", "Sunlight", "Darkness of the Jungle", "Windless State",

  // 3. 【物質・工芸】質感と劣化を学習する (Materials & Textures)
  "Rusted Iron Scraps", "Polished Brass", "10-year-old Leather Shoes", "Faded Denim", "Sooty Chimney", "Wet Asphalt", "Freshly Baked Pottery", "Old Parchment", "Luster of Silk", "Obsidian",
  "Degraded Rubber", "Frosted Glass", "Rusted Bronze Statue", "Fired Brick", "High-end Velvet", "Well-worn Linen", "Damp Concrete", "Crushed Marble", "Puddle with an Oil Film", "Dry Clay",
  "Dull Luster of Tin", "Soot", "Jade", "Charred Wood", "Luster of Pearl", "Warped Plastic", "Old Movie Film", "Silver Spoon", "Insect in Amber", "Wallpaper of a Ruined House",
  "Satin Dress", "Gravel Road", "Limestone", "Rusted Bicycle", "Wool Sweater", "Freshly Sharpened Pencil", "Lacquerware", "Cloudy Mirror", "Soda Glass", "Canvas",
  "Cement", "Animal Fur", "Shadow of a Bamboo Forest", "Sandpaper", "Bluish-white of a Fluorescent Lamp", "Ash from a Bonfire", "Candle Flame", "Charcoal", "Old Coins", "Rusted Chain",
  "Polished Marble", "Decayed Wooden Bench", "Vinyl Umbrella", "Old Vinyl Record", "Standout Color",
  "Body Hair (Asian Male)", "Body Hair (African Male)", "Body Hair (European Male)",
  "Skin Tone (Asian Male)", "Skin Tone (African Male)", "Skin Tone (European Male)",
  "Hair Color (Asian Male)", "Hair Color (African Male)", "Hair Color (European Male)",

  // 4. 【食べ物・文化】味覚と香りを色に変換する (Food & Culture)
  "Burnt Caramel", "Freshly Brewed Black Coffee", "Aged Wine", "Extremely Spicy Spices", "Freshly Harvested Honey", "Freshly Toasted Bread", "Rotting Apple", "Uji Matcha", "Beer Foam", "Richness of Soy Sauce",
  "Freshly Squeezed Lemon", "Melting Butter", "Smoked Meat", "Strawberry Milk", "Dried Herbs", "Bitter Chocolate", "Lukewarm Ramune", "Freshly Caught Mackerel", "Dregs of Red Wine", "Ripe Mango",
  "Sparkling Water", "Steamed Bun", "Herbal Medicine", "Overcooked Curry", "Chilled Champagne", "Almond Tofu", "Roasted Sweet Potato", "Pickled Plum Paste", "Hojicha (Roasted Green Tea)", "Blue Cheese",
  "Chocolate Banana", "Olive Oil", "Black Honey (Kuromitsu)", "Sugar Craft", "Yakiniku Sauce", "Melon Soda", "Cinnamon Powder", "Balsamic Vinegar", "Truffle", "Freshly Baked Cookies",
  "Ginger Ale", "Cocoa", "Milk", "Black Tea Leaves", "Granulated Sugar", "Mizu-yokan (Sweet Bean Jelly)", "Grapefruit", "Mint Tea", "Red Rice (Sekihan)", "Wilted Lettuce",

  // 5. 【時間・空間】空気感を数値化する (Time & Space)
  "Classroom at 4 PM", "Service Area at Midnight", "First Train Platform", "Deserted Amusement Park", "1980s Back Alley", "Surface of an Unknown Planet", "Hospital Waiting Room", "Heat of a Live House", "Corner of a Library", "National Highway at Sunset",
  "Silence After a Festival", "Factory Night View", "Fireplace in a Log House", "Bus Stop on a Rainy Day", "Cyberpunk Slums", "Stained Glass of an Old Church", "Saturday Afternoon", "Fluorescent Lamp in an Underground Parking Lot", "Harbor in Morning Mist", "Music Room After School",
  "Highway Tunnel", "Midwinter Sunroom", "Red Lantern of a Food Stall", "Inside an Elevator", "Stairs of a Ruined Building", "Secret Base", "Convenience Store at Night", "Pitch-black Theater", "Schoolyard in Summer Vacation", "Seaside Town with a Sea Breeze",
  "Shrine Grounds", "Urban Hustle and Bustle", "Foggy London", "Inorganicity of an Office", "Children's Room", "Back of a Closet", "Open-air Bath", "Exhibition Hall", "Night View from a Rooftop", "Morning in the Washroom",
  "Bar Counter", "School Route", "Hotel Window on a Trip", "Crowded Train", "Park Bench", "Quiet Residential Area", "Lunar Base", "Aquarium Tunnel", "Entrance to Ruins", "Scenery in Memories",

  // 6. 【概念・アート】抽象を色彩に固定する (Concepts & Art)
  "Order", "Chaos", "Elegance", "Minimalism", "Retro-future", "Violence", "Cleanliness", "Mystery", "Classic", "Sense of Speed",
  "Eternity", "Moment (Setsuna)", "Poison", "Transparency", "Profoundness", "Vanity", "Purity", "Decadence", "Prosperity", "Fall (Downfall)",
  "Intellect", "Wildness", "Digital", "Analog", "Dreaminess", "Truth", "Lie", "Balance", "Rhythm", "Silence",
  "Bustle", "Tradition", "Innovation", "Peace of Mind", "Tension", "Harmony", "Friction", "Ego", "Selflessness", "Romanticism",
  "Individualistic", "Commonplace", "Fastidious", "Realism", "Madness", "Sanity", "Yugen (Subtle Grace)", "Wabi-sabi", "Modern", "Noise", "Pure", "Forbidden", "Destiny",

  // 7. 【その他】自由に連想してもらうための予備軍 (Others)
  "Luxurious Blue", "Luxurious Red", "Luxurious Green", "Luxurious Yellow", "Luxurious Purple", "Luxurious Orange", "Luxurious Pink", "Luxurious Teal", "Luxurious Brown", "Luxurious Gray",
  "Cheap Blue", "Cheap Red", "Cheap Green", "Cheap Yellow", "Cheap Purple", "Cheap Orange", "Cheap Pink", "Cheap Teal", "Cheap Brown", "Cheap Gray"
];

if (TOPICS.length !== TOPICS_ENG.length) {
  throw new Error('TOPICS と TOPICS_ENG の要素数が一致していません');
}

/* ============================================================
2. ゲーム状態（state）
============================================================ */
let state = {
  players: [],           // { name: string, score: number }[]
  cycleCount: 2,         // 総サイクル数
  currentCycle: 1,       // 現在のサイクル番号

  currentRankerIdx: 0,   // ランキング担当プレイヤーの index
  makerOrder: [],        // 色作りプレイヤーの index 配列
  currentMakerPos: 0,    // makerOrder 内の現在位置

  topic: '',             // 今ラウンドのお題（日本語）
  topicEng: '',          // 今ラウンドのお題（英語）
  madeColors: [],        // 色データ配列
  rankingOrder: [],      // madeColors の index を1位から並べた配列

  timerInterval: null,   // setInterval の ID
  timerRemaining: 20,    // タイマー残り秒数

  totalTurns: 0,         // ゲーム全体のターン総数
  completedTurns: 0,     // 完了済みターン数

  answerLogs: [],        // 全回答ログ
  makeStartTime: null    // 色作り開始時刻
};

/* ============================================================
3. 画面切り替え
============================================================ */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  window.scrollTo(0, 0);
}

function buildStatusHTML() {
  const turn = state.completedTurns + 1;
  const total = state.totalTurns;
  return `<span class="pill">サイクル ${state.currentCycle}/${state.cycleCount}</span> <span class="pill">ターン ${turn}/${total}</span>`;
}

/* ============================================================
4. セットアップフェーズ
============================================================ */
function goToNames() {
  const count = parseInt(document.getElementById('player-count').value, 10);
  const cycles = parseInt(document.getElementById('cycle-count').value, 10);

  if (isNaN(count) || count < 3) {
    alert('プレイ人数は3人以上にしてください');
    return;
  }
  if (isNaN(cycles) || cycles < 1) {
    alert('サイクル数は1以上にしてください');
    return;
  }

  state.cycleCount = cycles;

  const container = document.getElementById('name-inputs');
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `
      <span class="player-num">${i + 1}</span>
      <input type="text" value="player${i + 1}" placeholder="player${i + 1}" id="pname-${i}">
    `;
    container.appendChild(row);
  }

  state.players = Array.from({ length: count }, (_, i) => ({
    name: `player${i + 1}`,
    score: 0,
  }));

  showScreen('screen-names');
}

function backToSetup() {
  showScreen('screen-setup');
}

function startGame() {
  const count = state.players.length;

  for (let i = 0; i < count; i++) {
    const val = document.getElementById(`pname-${i}`).value.trim();
    state.players[i].name = val || `プレイヤー${i + 1}`;
    state.players[i].score = 0;
  }

  state.currentCycle = 1;
  state.currentRankerIdx = 0;
  state.totalTurns = count * state.cycleCount;
  state.completedTurns = 0;
  state.answerLogs = [];

  startTurn();
}

/* ============================================================
5. ターン開始
============================================================ */
function startTurn() {
  const rankerIdx = state.currentRankerIdx;

  state.makerOrder = state.players.map((_, i) => i).filter(i => i !== rankerIdx);
  state.currentMakerPos = 0;
  state.madeColors = [];
  state.rankingOrder = [];

  const topicIndex = Math.floor(Math.random() * TOPICS.length);
  state.topic = TOPICS[topicIndex];
  state.topicEng = TOPICS_ENG[topicIndex];

  document.getElementById('intro-status').innerHTML = buildStatusHTML();
  document.getElementById('intro-ranker-name').textContent = state.players[rankerIdx].name;
  document.getElementById('intro-topic').textContent = `${state.topic} / ${state.topicEng}`;

  showScreen('screen-round-intro');
}

/* ============================================================
6. 色作りフェーズ
============================================================ */
function startMakingPhase() {
  passToNextMaker();
}

function passToNextMaker() {
  const makerIdx = state.makerOrder[state.currentMakerPos];
  document.getElementById('pass-maker-name').textContent = state.players[makerIdx].name;
  showScreen('screen-pass-to-maker');
}

function startMakerTimer() {
  document.getElementById('make-status').innerHTML =
    buildStatusHTML() +
    ` <span class="pill">${state.currentMakerPos + 1}/${state.makerOrder.length}人目</span>`;

  document.getElementById('make-topic').textContent = `${state.topic} / ${state.topicEng}`;

  // HSL スライダーをランダム初期化
  document.getElementById('h-slider').value = Math.floor(Math.random() * 361);
  document.getElementById('s-slider').value = Math.floor(Math.random() * 101);
  document.getElementById('l-slider').value = Math.floor(Math.random() * 101);

  state.makeStartTime = Date.now();
  updateColor();

  clearInterval(state.timerInterval);
  state.timerRemaining = 20;
  updateTimerUI(20);

  state.timerInterval = setInterval(() => {
    state.timerRemaining--;
    updateTimerUI(state.timerRemaining);

    if (state.timerRemaining <= 0) {
      clearInterval(state.timerInterval);
      submitColor();
    }
  }, 1000);

  showScreen('screen-make-color');
}

function updateColor() {
  const h = parseInt(document.getElementById('h-slider').value, 10);
  const s = parseInt(document.getElementById('s-slider').value, 10);
  const l = parseInt(document.getElementById('l-slider').value, 10);

  document.getElementById('h-val').textContent = h;
  document.getElementById('s-val').textContent = s;
  document.getElementById('l-val').textContent = l;

  const { r, g, b } = hslToRgb(h, s, l);
  const colorString = `rgb(${r}, ${g}, ${b})`;

  document.getElementById('color-preview').style.background = colorString;

  const hslText = document.getElementById('color-hsl-text');
  const rgbText = document.getElementById('color-rgb-text');

  if (hslText) hslText.textContent = `hsl(${h}, ${s}%, ${l}%)`;
  if (rgbText) rgbText.textContent = `rgb(${r}, ${g}, ${b})`;
}

function updateTimerUI(t) {
  const arc = document.getElementById('timer-arc');
  const txt = document.getElementById('timer-text');
  const circumference = 263.9;
  const offset = circumference * (1 - t / 20);

  arc.style.strokeDashoffset = offset;
  txt.textContent = t;

  if (t <= 5) {
    arc.style.stroke = 'var(--accent)';
    txt.style.fill = 'var(--accent)';
  } else if (t <= 10) {
    arc.style.stroke = '#ffaa00';
    txt.style.fill = '#ffaa00';
  } else {
    arc.style.stroke = 'var(--accent3)';
    txt.style.fill = 'var(--text)';
  }
}

function submitColor() {
  clearInterval(state.timerInterval);

  const h = parseInt(document.getElementById('h-slider').value, 10);
  const s = parseInt(document.getElementById('s-slider').value, 10);
  const l = parseInt(document.getElementById('l-slider').value, 10);
  const { r, g, b } = hslToRgb(h, s, l);

  const elapsedMs = state.makeStartTime ? (Date.now() - state.makeStartTime) : 0;
  const elapsedSeconds = Math.min(20, +(elapsedMs / 1000).toFixed(2));

  const makerIdx = state.makerOrder[state.currentMakerPos];
  const makerName = state.players[makerIdx].name;

  const colorData = {
    playerIdx: makerIdx,
    playerName: makerName,
    topic: state.topic,
    topicEng: state.topicEng,
    r,
    g,
    b,
    h,
    s,
    l,
    answerTime: elapsedSeconds,
    rank: null
  };

  state.madeColors.push(colorData);

  state.answerLogs.push({
    cycle: state.currentCycle,
    round: state.completedTurns + 1,
    topic: state.topic,
    topicEng: state.topicEng,
    playerIdx: makerIdx,
    playerName: makerName,
    rgb: { r, g, b },
    hsl: { h, s, l },
    answerTime: elapsedSeconds,
    rank: null
  });

  const preview = document.getElementById('submitted-preview');
  if (preview) {
    preview.style.background = `rgb(${r}, ${g}, ${b})`;
  }

  const info = document.getElementById('submitted-info');
  if (info) {
    info.textContent = `${makerName} の色を保存しました（${elapsedSeconds}秒）`;
  }

  const nextInfo = document.getElementById('submitted-next-info');
  if (nextInfo) {
    const isLastMaker = state.currentMakerPos >= state.makerOrder.length - 1;
    nextInfo.textContent = isLastMaker
      ? '全員の色作りが完了しました。次はランキングです。'
      : '次のプレイヤーへスマホを渡してください。';
  }

  showScreen('screen-color-submitted');
}

function nextMaker() {
  const isLastMaker = state.currentMakerPos >= state.makerOrder.length - 1;

  if (isLastMaker) {
    startRankingPhase();
  } else {
    state.currentMakerPos++;
    passToNextMaker();
  }
}

/* ============================================================
7. ランキングフェーズ
============================================================ */
function startRankingPhase() {
  const rankerIdx = state.currentRankerIdx;

  document.getElementById('ranking-status').innerHTML = buildStatusHTML();
  document.getElementById('ranking-ranker-name').textContent = state.players[rankerIdx].name;
  document.getElementById('ranking-topic').textContent = `${state.topic} / ${state.topicEng}`;

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

function confirmRanking() {
  const items = document.querySelectorAll('#draggable-colors .draggable-item');
  state.rankingOrder = [];

  items.forEach((item, rankIndex) => {
    const colorIdx = parseInt(item.dataset.colorIdx, 10);
    state.rankingOrder.push(colorIdx);

    const colorData = state.madeColors[colorIdx];
    colorData.rank = rankIndex + 1;

    const targetLog = state.answerLogs.find(log =>
      log.cycle === state.currentCycle &&
      log.round === state.completedTurns + 1 &&
      log.topic === state.topic &&
      log.topicEng === state.topicEng &&
      log.playerIdx === colorData.playerIdx &&
      log.rank === null
    );

    if (targetLog) {
      targetLog.rank = rankIndex + 1;
    }
  });

  showRoundResult();
}

/* ============================================================
8. ドラッグソート
============================================================ */
let draggedItem = null;

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

function updateRankingNumbers() {
  const items = document.querySelectorAll('#draggable-colors .draggable-item');

  items.forEach((item, index) => {
    const numEl = item.querySelector('.rank-number');
    const titleEl = item.querySelector('.ranking-title');

    if (numEl) numEl.textContent = index + 1;
    if (titleEl) titleEl.textContent = `色 ${index + 1}`;
  });
}

/* ============================================================
9. スコア計算・結果表示
============================================================ */
function showRoundResult() {
  document.getElementById('result-status').innerHTML = buildStatusHTML();

  const list = document.getElementById('round-result-list');
  list.innerHTML = '';

  const makerCount = state.makerOrder.length;

  state.rankingOrder.forEach((colorIdx, rank) => {
    const color = state.madeColors[colorIdx];
    const player = state.players[color.playerIdx];

    const points = makerCount - rank;
    player.score += points;

    const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;

    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <div>${rank + 1}位</div>
      <div style="width:40px;height:40px;border-radius:8px;background:${rgb}"></div>
      <div>${player.name}</div>
      <div>+${points}pt</div>
    `;
    list.appendChild(row);
  });

  updateScoreBoard();
  showScreen('screen-round-result');
}

function updateScoreBoard() {
  const list = document.getElementById('current-scores');
  list.innerHTML = '';

  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  sorted.forEach(p => {
    const row = document.createElement('div');
    row.innerHTML = `
      <div>${p.name}</div>
      <div>${p.score}pt</div>
    `;
    list.appendChild(row);
  });
}

function nextRound() {
  state.completedTurns++;

  const playerCount = state.players.length;
  state.currentRankerIdx++;

  if (state.currentRankerIdx >= playerCount) {
    state.currentRankerIdx = 0;
    state.currentCycle++;
  }

  if (state.currentCycle > state.cycleCount) {
    showFinalResult();
    return;
  }

  startTurn();
}

/* ============================================================
10. 最終結果・リセット
============================================================ */
function showFinalResult() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  document.getElementById('winner-name').textContent = winner.name;

  const list = document.getElementById('final-scores');
  list.innerHTML = '';

  sorted.forEach((p, i) => {
    const row = document.createElement('div');
    row.innerHTML = `
      <div>${i + 1}位</div>
      <div>${p.name}</div>
      <div>${p.score}pt</div>
    `;
    list.appendChild(row);
  });

  showScreen('screen-final');
}

function resetGame() {
  state.players.forEach(p => p.score = 0);

  state.currentCycle = 1;
  state.currentRankerIdx = 0;
  state.completedTurns = 0;
  state.answerLogs = [];
  state.madeColors = [];
  state.rankingOrder = [];
  state.topic = '';
  state.topicEng = '';
  clearInterval(state.timerInterval);

  showScreen('screen-setup');
}

/* ============================================================
11. HSL → RGB 変換
============================================================ */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (0 <= h && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (60 <= h && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (120 <= h && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (180 <= h && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (240 <= h && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  return { r, g, b };
}

/* ============================================================
12. ログ出力
============================================================ */
function getGameLogs() {
  return state.answerLogs;
}

function exportLogsAsCSV() {
  const header = [
    'cycle',
    'round',
    'topic',
    'topicEng',
    'playerIdx',
    'playerName',
    'r',
    'g',
    'b',
    'h',
    's',
    'l',
    'answerTime',
    'rank'
  ];

  const rows = state.answerLogs.map(log => [
    log.cycle,
    log.round,
    log.topic,
    log.topicEng,
    log.playerIdx,
    log.playerName,
    log.rgb.r,
    log.rgb.g,
    log.rgb.b,
    log.hsl.h,
    log.hsl.s,
    log.hsl.l,
    log.answerTime,
    log.rank
  ]);

  const csvContent = [header, ...rows]
    .map(row => row.map(v => `"${v}"`).join(','))
    .join('\n');

  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'color_battle_logs.csv';
  link.click();
  URL.revokeObjectURL(url);
}