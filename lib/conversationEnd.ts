const MARKER = "__CONVERSATION_END__";

export function parseConversationEnd(raw: string): {
  text: string;
  conversation_end: boolean;
} {
  const trimmed = raw.trimEnd();
  const lastNl = trimmed.lastIndexOf("\n");
  const lastLine = lastNl === -1 ? trimmed : trimmed.slice(lastNl + 1).trim();

  if (lastLine === MARKER) {
    const text = lastNl === -1 ? "" : trimmed.slice(0, lastNl).trimEnd();
    return { text, conversation_end: true };
  }

  return { text: trimmed, conversation_end: false };
}
