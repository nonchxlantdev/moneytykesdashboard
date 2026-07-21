import { useRef, useState } from "react";
import { FileUp, Play } from "lucide-react";
import CoinSpinner from "../shared/CoinSpinner";

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
      {isStoring ? <CoinSpinner size={28} label="Saving file" className="studio-dropzone-coin" /> : null}
    </div>
  );
}

/**
 * Source field for video / presentation / optional class-lesson PDF.
 * Class-lesson PDF is shown whenever showOptionalDocument is true (own section on create + edit).
 */
export default function ContentSourceField({
  type,
  value,
  onChange,
  error,
  fileName,
  isStoring = false,
  showOptionalDocument = false
}) {
  if (type === "plan" || type === "document") {
    if (!showOptionalDocument) return null;

    return (
      <div className="studio-field studio-optional-doc">
        <StudioDropzone
          hint="PDF only · up to 20MB"
          accept=".pdf,application/pdf"
          fileName={fileName || value}
          isStoring={isStoring}
          onFileSelected={onChange}
        />
        {error ? <p className="studio-error">{error}</p> : null}
        {fileName && !isStoring && !error ? (
          <p className="studio-file-note">Saved locally. This PDF can be shown when you start the lesson.</p>
        ) : null}
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="studio-field">
        <label htmlFor="studio-youtube-url">
          YouTube URL <span className="field-optional">(optional)</span>
        </label>
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

  return (
    <div className="studio-field">
      <label>
        Upload Presentation <span className="field-optional">(optional)</span>
      </label>
      <StudioDropzone
        hint="or drag and drop · PPT or PDF up to 30MB"
        accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
        fileName={fileName || value}
        isStoring={isStoring}
        onFileSelected={onChange}
      />
      {error ? <p className="studio-error">{error}</p> : null}
      {fileName && !isStoring && !error ? (
        <p className="studio-file-note">
          Saved locally for testing. PDF files can be presented in-app; PowerPoint files can be downloaded until
          conversion is connected.
        </p>
      ) : null}
    </div>
  );
}
