import type { ReactNode } from "react";

function safeHref(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function renderInlineMarkdown(text: string, keyPrefix: string) {
  const tokens =
    /(\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|https?:\/\/[^\s<]+)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(tokens)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    if (value.startsWith("**") || value.startsWith("__")) {
      nodes.push(<strong key={`${keyPrefix}-${index}`}>{value.slice(2, -2)}</strong>);
    } else {
      const markdownLink = /^\[([^\]]+)\]\((.+)\)$/.exec(value);
      const rawHref = markdownLink?.[2] ?? value;
      const href = safeHref(rawHref) ?? safeHref(rawHref.replace(/[.,!?]+$/, ""));
      if (href) {
        const label = markdownLink?.[1] ?? value.replace(/[.,!?]+$/, "");
        nodes.push(
          <a
            key={`${keyPrefix}-${index}`}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
          >
            {label}
          </a>,
        );
        if (!markdownLink && label.length < value.length) nodes.push(value.slice(label.length));
      } else {
        nodes.push(value);
      }
    }
    cursor = index + value.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function renderAssistantMarkdown(content: string) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index]?.trim()) {
      index++;
      continue;
    }
    const unordered = /^\s*[-*]\s+/.test(lines[index] ?? "");
    const ordered = /^\s*\d+\.\s+/.test(lines[index] ?? "");
    if (unordered || ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const line = lines[index] ?? "";
        const item = unordered ? /^\s*[-*]\s+(.+)$/.exec(line) : /^\s*\d+\.\s+(.+)$/.exec(line);
        if (!item) break;
        items.push(item[1] ?? "");
        index++;
      }
      const List = unordered ? "ul" : "ol";
      blocks.push(
        <List key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`}>
              {renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}
            </li>
          ))}
        </List>,
      );
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index]?.trim()) {
      if (paragraph.length && /^\s*(?:[-*]\s+|\d+\.\s+)/.test(lines[index] ?? "")) break;
      paragraph.push(lines[index] ?? "");
      index++;
    }
    blocks.push(
      <p key={`paragraph-${index}`}>
        {paragraph.map((line, lineIndex) => (
          <span key={`line-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {renderInlineMarkdown(line, `paragraph-${index}-${lineIndex}`)}
          </span>
        ))}
      </p>,
    );
  }
  return blocks;
}
