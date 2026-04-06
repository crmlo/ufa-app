export type EmergencyKind = "violence" | "medical" | "crisis";

const PREFIX = "__EMERGENCY__:";

export function parseEmergencyMarker(raw: string): {
  text: string;
  emergency: EmergencyKind | null;
} {
  const trimmed = raw.trimEnd();
  const lastNl = trimmed.lastIndexOf("\n");
  const lastLine = lastNl === -1 ? trimmed : trimmed.slice(lastNl + 1).trim();

  if (!lastLine.startsWith(PREFIX)) {
    return { text: trimmed, emergency: null };
  }

  const kind = lastLine.slice(PREFIX.length).trim().toLowerCase();
  const body =
    lastNl === -1 ? "" : trimmed.slice(0, lastNl).trimEnd();

  if (kind === "none" || kind === "") {
    return { text: body, emergency: null };
  }

  if (kind === "violence" || kind === "medical" || kind === "crisis") {
    return { text: body, emergency: kind };
  }

  return { text: trimmed, emergency: null };
}
