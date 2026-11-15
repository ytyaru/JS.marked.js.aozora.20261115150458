/*
// ルビ記法（｜親文字《ルビ》）の拡張定義例
const rubyExtension = {
  name: 'ruby',
  level: 'inline', // インライン要素として安全に処理
  start(src) { return src.indexOf('｜'); },
  tokenizer(src) {
    const rule = /^｜([^《\n]+)《([^》\n]+)》/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'ruby',
        raw: match[0],
        text: match[1],
        ruby: match[2]
      };
    }
  },
  renderer(token) {
    return `<ruby>${token.text}<rt>${token.ruby}</rt></ruby>`;
  }
};

// パーサーに組み込む（傍点や割り注も同じ形式で並べて登録可能）
marked.use({ extensions: [rubyExtension] });
*/

// 1. 親文字ありルビ（｜親文字《ルビ》）と 親文字省略ルビ（漢字《かんじ》）
const rubyExtension = {
  name: 'ruby',
  level: 'inline',
  start(src) {
    // 「｜」または「漢字＋《」の開始位置を探す
    const match = src.match(/｜|[一-龠々〆ヵヶ]+《/);
    return match ? match.index : -1;
  },
  tokenizer(src) {
    // パターンA: ｜で開始する場合（漢字以外も親文字にできる）
    const pipeRule = /^｜([^《\n]+)《([^》\n]+)》/;
    // パターンB: ｜を省略した場合（連続する漢字のみを親文字とする）
//    const kanjiRule = /^([一-龠々〆ヵヶ]+)《([^》\n]+)》/;
//    const kanjiRule = /^([\p{Script=Han}〇々仝〆ヵヶ]+)《([^》\n]+)》/u;
    // \p{Script=Han} に加え、非漢字の準漢字・踊り字・小書きヶヵ・異体字セレクタ(\uFE00-\uFE0F, \u{E0100}-\u{E01EF})を網羅
    const kanjiPattern = '[\\p{Script=Han}〇々〆〻〼ヶヵヿ\\uFE00-\\uFE0F\\u{E0100}-\\u{E01EF}]+';
    const kanjiRule = new RegExp(`^(${kanjiPattern})《([^》\\n]+)》`, 'u');

    const match = pipeRule.exec(src) || kanjiRule.exec(src);
    if (match) {
      return {
        type: 'ruby',
        raw: match[0],
        text: match[1],
        ruby: match[2]
      };
    }
  },
  renderer(token) {
    return `<ruby>${token.text}<rt>${token.ruby}</rt></ruby>`;
  }
};

// 2. 傍点（《《強調》》）
const botenExtension = {
  name: 'boten',
  level: 'inline',
  start(src) {
    return src.indexOf('《《');
  },
  tokenizer(src) {
    const rule = /^《《([^》\n]+)》》/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'boten',
        raw: match[0],
        text: match[1]
      };
    }
  },
  renderer(token) {
//    return `<em class="boten">${token.text}</em>`;
    return `<em>${token.text}</em>`;
  }
};

const escapeJpExtension = {
  name: 'escapeJp',
  level: 'inline',
  start(src) {
    const match = src.match(/[｀\\＼]/);
    return match ? match.index : -1;
  },
  tokenizer(src) {
    // 1. 全角バッククォートによる範囲エスケープ（｀...｀ → 純粋なtextとして出力）
    const rangeRule = /^｀([^｀\n]+)｀/;
    const rangeMatch = rangeRule.exec(src);
    if (rangeMatch) {
      return {
        type: 'text',
        raw: rangeMatch,
        text: rangeMatch
      };
    }

    // 2. 半角・全角バックスラッシュによる1文字エスケープ（\｜, ＼《 など）
    const singleRule = /^[\\＼]([｜《》＊｀\\＼])/;
    const singleMatch = singleRule.exec(src);
    if (singleMatch) {
      return {
        type: 'text',
        raw: singleMatch,
        text: singleMatch
      };
    }
  }
};

// 配列の後ろに書いた botenExtension が先に評価されるため、二重山括弧の誤爆を防げる
marked.use({ extensions: [rubyExtension, botenExtension, escapeJpExtension] });
