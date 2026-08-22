const DOCUMENT_START = /^(?:<!DOCTYPE\b|<html[\s>]|<!--)/i;
const OPEN_TAG = /^<([A-Za-z][A-Za-z0-9]*)\b/;

const HTML_ELEMENTS = new Set([
  "a",
  "article",
  "aside",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "code",
  "div",
  "em",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "img",
  "input",
  "label",
  "li",
  "link",
  "main",
  "meta",
  "nav",
  "ol",
  "p",
  "pre",
  "script",
  "section",
  "span",
  "style",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "th",
  "thead",
  "title",
  "tr",
  "ul",
  "video",
]);

export function looksLikeHtml(text: string): boolean {
  const start = text.trimStart();
  if (DOCUMENT_START.test(start)) {
    return true;
  }
  const tag = start.match(OPEN_TAG)?.[1]?.toLowerCase();
  if (!tag) {
    return false;
  }
  return HTML_ELEMENTS.has(tag);
}
