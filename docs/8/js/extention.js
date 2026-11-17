// 1. ルビ拡張（｜親文字《ルビ》 と 漢字《ルビ》）
const kanjiPattern = '[\\p{Script=Han}〇々〆〻〼ヶヵヿ\\uFE00-\\uFE0F\\u{E0100}-\\u{E01EF}]+';
const rubyExtension = {
  name: 'ruby',
  level: 'inline',
  start(src) {
    const match = src.match(new RegExp(`｜|${kanjiPattern}《`, 'u'));
    return match ? match.index : -1;
  },
  tokenizer(src) {
    const match = /^｜([^《\n]+)《([^》\n]+)》/.exec(src)
               || new RegExp(`^(${kanjiPattern})《([^》\\n]+)》`, 'u').exec(src);
    if (match) {
      return {
        type: 'ruby',
        raw: match.at(0),
        text: match.at(1),
        ruby: match.at(2)
      };
    }
  },
  renderer(token) {
    return `<ruby>${token.text}<rt>${token.ruby}</rt></ruby>`;
  }
};

// 2. 傍点拡張（《《強調》》 → <em lang="ja">）
const botenExtension = {
  name: 'boten',
  level: 'inline',
  start(src) {
    return src.indexOf('《《');
  },
  tokenizer(src) {
    const match = /^《《([^》\n]+)》》/.exec(src);
    if (match) {
      return {
        type: 'boten',
        raw: match.at(0),
        text: match.at(1)
      };
    }
  },
  renderer(token) {
    return `<em lang="ja">${token.text}</em>`;
  }
};

// 3. エスケープ拡張（｀範囲｀ と ＼単一 / \単一）
const escapeJpExtension = {
  name: 'escapeJp',
  level: 'inline',
  start(src) {
    const match = src.match(/[｀\\＼]/);
    return match ? match.index : -1;
  },
  tokenizer(src) {
    const rangeMatch = /^｀([^｀\n]+)｀/.exec(src);
    if (rangeMatch) {
      return {
        type: 'text',
        raw: rangeMatch.at(0),
        text: rangeMatch.at(1)
      };
    }
    const singleMatch = /^[\\＼]([｜《》｀\\＼])/.exec(src);
    if (singleMatch) {
      return {
        type: 'text',
        raw: singleMatch.at(0),
        text: singleMatch.at(1)
      };
    }
  }
};

// 3連続以上の改行を検知して <br> を出力するカスタム拡張
const multiNewlineExtension = {
  name: 'multiNewline',
  level: 'block', // ブロック要素（段落レベル）として処理
  start(src) {
    // 3連続以上の改行がある位置を探す
    const match = src.match(/\n{3,}/);
    return match ? match.index : undefined;
  },
  tokenizer(src, tokens) {
    // 先頭が3連続以上の改行から始まっている場合にマッチ
    const rule = /^(\n{3,})/;
    const match = rule.exec(src);
    if (match) {
      const newlineCount = match[1].length;
      return {
        type: 'multiNewline',
        raw: match[0],
        // 仕様通り (連続改行数 - 2) 個の <br> を作るための数値を保持
        brCount: newlineCount - 2
      };
    }
  },
  renderer(token) {
    // 指定された数だけ <br> を出力する
    return '<br>'.repeat(token.brCount) + '\n';
  }
};

marked.use({
  breaks: true, // 1連続改行を <br> に変換する標準オプション
  renderer: {
    em(token) {
      return `<em lang="en">${this.parser.parseInline(token.tokens)}</em>`;
    }
  },
  extensions: [multiNewlineExtension, rubyExtension, botenExtension, escapeJpExtension]
});
