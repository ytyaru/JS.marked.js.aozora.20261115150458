// marked.jsにオプションと拡張機能を適用
marked.use({
  breaks: true, // 1連続改行を <br> に変換する標準オプション
  extensions: [multiNewlineExtension]
});
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

