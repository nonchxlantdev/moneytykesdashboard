import { useRef, useState } from "react";
import { FileUp, Play } from "lucide-react";

function StudioDropzone({ hint, accept, onFileSelected, fileName, isStoring }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    onFileSelected?.(file);
  }

  return (
    <div
      className={`studio-dropzone ${dragging ? "dragging" : ""} ${fileName ? "has-file" : ""} ${isStoring ? "is-storing" : ""}`}
      onDragOver={event => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onClick={() => {
        if (!isStoring) inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!isStoring) inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={event => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <FileUp size={22} aria-hidden="true" />
      <strong>{isStoring ? "Saving file locally…" : fileName || "Choose a file"}</strong>
      <span>{isStoring ? "Keep this page open until saving finishes." : hint}</span>
    </div>
  );
}

export default function ContentSourceField({
  type,
  value,
  onChange,
  error,
  fileName,
  isStoring = false
}) {
  if (type === "video") {
    return (
      <div className="studio-field">
        <label htmlFor="studio-youtube-url">YouTube URL</label>
        <div className="input-wrap">
          <Play size={16} aria-hidden="true" />
          <input
            id="studio-youtube-url"
            type="url"
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        {error ? <p className="studio-error">{error}</p> : null}
      </div>
    );
  }

  const config =
    type === "document"
      ? {
          label: "Upload Document",
          hint: "PDF only · up to 20MB · Word files are not supported",
          accept: ".pdf,application/pdf"
        }
      : {
          label: "Upload Presentation",
          hint: "or drag and drop · PPT or PDF up to 30MB",
          accept: ".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
        };

  return (
    <div className="studio-field">
      <label>{config.label}</label>
      <StudioDropzone
        hint={config.hint}
        accept={config.accept}
        fileName={fileName || value}
        isStoring={isStoring}
        onFileSelected={onChange}
      />
      {error ? <p className="studio-error">{error}</p> : null}
      {!error && type === "document" && !fileName ? (
        <p className="studio-file-note">
          Export your document as a PDF before uploading so it can be previewed and presented in class.
        </p>
      ) : null}
      {fileName && !isStoring && !error ? (
        <p className="studio-file-note">
          {type === "document"
            ? "Saved locally. This PDF can be previewed and presented in-app."
            : "Saved locally for testing. PDF files can be presented in-app; PowerPoint files can be downloaded until conversion is connected."}
        </p>
      ) : null}
    </div>
  );
}
