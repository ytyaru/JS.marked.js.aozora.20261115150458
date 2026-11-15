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

