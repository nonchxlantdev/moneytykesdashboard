import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { sanitizeLessonHtml } from "../../utils/sanitizeLessonHtml";

// Font-size toolbar removed: execCommand("fontSize") with styleWithCSS emits
// style= attributes; allowing style safely is fiddly, so we omit it from the
// DOMPurify allow-list entirely (see sanitizeLessonHtml.js).

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ""));
}

/** Convert plain notes into simple paragraph HTML for the editor. */
export function plainTextToNotesHtml(text) {
  if (!text?.trim()) return "";
  if (looksLikeHtml(text)) return text;
  return text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

export function isBlankRichText(html) {
  const text = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function runCommand(command, value = null) {
  document.execCommand(command, false, value);
}

/**
 * Rich-text notes editor (Notes field only).
 * Stores HTML so flashcards can show bold, italic, lists, etc.
 */
export default function NotesRichEditor({
  id,
  value,
  onChange,
  error,
  placeholder = "Write the lesson content students will follow…",
  required = false,
  describedBy
}) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const nextHtml = plainTextToNotesHtml(value || "");
    if (nextHtml === lastHtmlRef.current) return;
    if (editor.innerHTML === nextHtml) {
      lastHtmlRef.current = nextHtml;
      return;
    }
    editor.innerHTML = nextHtml || "";
    lastHtmlRef.current = nextHtml;
  }, [value]);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    // Sanitize at write-time so stored lessons never hold XSS payloads
    // (defense in depth alongside formatLessonText at render).
    const raw = isBlankRichText(editor.innerHTML) ? "" : editor.innerHTML;
    const html = raw ? sanitizeLessonHtml(raw) : "";
    lastHtmlRef.current = html;
    onChange?.(html);
  }

  function apply(command, commandValue) {
    editorRef.current?.focus();
    runCommand("styleWithCSS", true);
    runCommand(command, commandValue);
    emitChange();
  }

  return (
    <div className={`notes-rich ${error ? "invalid" : ""}`}>
      <div className="notes-rich-toolbar" role="toolbar" aria-label="Notes formatting">
        <button type="button" className="notes-tool" title="Bold" aria-label="Bold" onMouseDown={event => event.preventDefault()} onClick={() => apply("bold")}>
          <Bold size={15} />
        </button>
        <button type="button" className="notes-tool" title="Italic" aria-label="Italic" onMouseDown={event => event.preventDefault()} onClick={() => apply("italic")}>
          <Italic size={15} />
        </button>
        <button type="button" className="notes-tool" title="Underline" aria-label="Underline" onMouseDown={event => event.preventDefault()} onClick={() => apply("underline")}>
          <Underline size={15} />
        </button>
        <span className="notes-tool-divider" aria-hidden="true" />
        <button type="button" className="notes-tool" title="Bullet list" aria-label="Bullet list" onMouseDown={event => event.preventDefault()} onClick={() => apply("insertUnorderedList")}>
          <List size={15} />
        </button>
        <button type="button" className="notes-tool" title="Numbered list" aria-label="Numbered list" onMouseDown={event => event.preventDefault()} onClick={() => apply("insertOrderedList")}>
          <ListOrdered size={15} />
        </button>
      </div>

      <div
        id={id}
        ref={editorRef}
        className="notes-rich-editor"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}
