/**
 * 将 Markdown 源文本转为可读纯文本（用于"复制"文本模式）
 * 去除标题/列表/引用/表格/强调/链接/代码围栏等标记，保留可读正文
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return "";

  // 先隔离代码内容，避免后续的表格和行内 Markdown 规则改写代码本身。
  let marker = "\uE000";
  while (markdown.includes(marker)) marker += "\uE000";
  const codeSegments: string[] = [];
  const protectCode = (code: string): string => {
    const token = `${marker}${codeSegments.length}\uE001`;
    codeSegments.push(code);
    return token;
  };

  // 1. 代码围栏 ```lang\n...\n``` → 仅保留代码内容
  let text = markdown.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code: string) =>
    protectCode(code.replace(/\r?\n$/, ""))
  );
  text = text.replace(/`([^`]+)`/g, (_, code: string) => protectCode(code));

  // 2. 逐行处理块级标记
  const lines = text.split("\n");
  const kept: string[] = [];
  for (const raw of lines) {
    let line = raw;
    // 水平分割线 / 表格分隔行：整行仅由 - : | * _ 空格组成且含标记符 → 丢弃
    if (/^[\s:|*_-]*$/.test(line) && /[-*_]/.test(line) && line.trim().length >= 3) {
      continue;
    }
    line = line.replace(/^\s{0,3}#{1,6}\s+/, ""); // 标题
    line = line.replace(/^\s*>\s?/, ""); // 引用
    line = line.replace(/^(\s*)(?:[-*+]|\d+\.)\s+/, "$1"); // 列表项标记
    // 表格数据行 | a | b | → a  b
    if (/^\s*\|.*\|\s*$/.test(line)) {
      line = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
        .join("  ");
    }
    kept.push(line);
  }
  text = kept.join("\n");

  // 3. 行内标记（均为单行模式，安全）
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1"); // 图片 → alt
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // 链接 → 文本
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2"); // 加粗
  text = text.replace(/(\*|_)(.*?)\1/g, "$2"); // 斜体
  text = text.replace(/~~(.*?)~~/g, "$1"); // 删除线

  // 4. 折叠多余空行并去首尾空白
  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  return normalized.replace(
    new RegExp(`${marker}(\\d+)\uE001`, "g"),
    (_, index: string) => codeSegments[Number(index)]
  );
}
