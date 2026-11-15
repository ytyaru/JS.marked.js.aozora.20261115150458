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

marked.use({
  renderer: {
    em(token) {
      return `<em lang="en">${this.parser.parseInline(token.tokens)}</em>`;
    }
  },
  extensions: [rubyExtension, botenExtension, escapeJpExtension]
});
