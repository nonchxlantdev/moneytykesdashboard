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
 * Fetch public oEmbed metadata (title + thumbnail). Duration requires Data API / key.
 * Uses noembed as a CORS-friendly proxy for browser calls.
 * @param {string} url
 * @returns {Promise<{ title?: string, thumbnailUrl?: string } | null>}
 */
export async function fetchYoutubeOEmbed(url) {
  if (!isValidYoutubeUrl(url)) return null;
  try {
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url.trim())}`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.error) return null;
    return {
      title: data.title || undefined,
      thumbnailUrl: data.thumbnail_url || youtubeThumbnail(url) || undefined
    };
  } catch {
    return { thumbnailUrl: youtubeThumbnail(url) || undefined };
  }
}

/**
 * Format lesson text for display. Rich Notes may already be HTML.
 * @param {string} text
 */
export function formatLessonText(text) {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return String(text)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+=(["']).*?\1/gi, "");
  }
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
