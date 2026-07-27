import DOMPurify from "dompurify";

/**
 * Allow-list for lesson Notes HTML.
 * Matches what NotesRichEditor can produce after dropping the font-size toolbar
 * (fontSize + styleWithCSS would need `style`, which is an XSS vector — keep tags only).
 * No img/a/svg/iframe, no href/src, no event handlers.
 */
const LESSON_HTML_CONFIG = {
  ALLOWED_TAGS: ["p", "strong", "em", "b", "i", "u", "ul", "ol", "li", "br", "div", "span"],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false
};

/** Sanitize rich lesson HTML before store or render. */
export function sanitizeLessonHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), LESSON_HTML_CONFIG);
}
