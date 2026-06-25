/**
 * Extract YouTube video ID from common URL formats.
 * @param {string} url
 * @returns {string|null}
 */
export function parseYoutubeVideoId(url) {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function isValidYoutubeUrl(url) {
  const id = parseYoutubeVideoId(url);
  return Boolean(id && /^[a-zA-Z0-9_-]{11}$/.test(id));
}

export function youtubeThumbnail(url) {
  const id = parseYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeEmbedUrl(url) {
  const id = parseYoutubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/**
 * Basic markdown-like formatting for lesson descriptions.
 * @param {string} text
 */
export function formatLessonText(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) {
        return `<li>${escapeHtml(trimmed.slice(2))}</li>`;
      }
      let html = escapeHtml(trimmed);
      html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
      return html ? `<p>${html}</p>` : "";
    })
    .join("")
    .replace(/(<li>.*<\/li>)+/g, match => `<ul>${match}</ul>`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
