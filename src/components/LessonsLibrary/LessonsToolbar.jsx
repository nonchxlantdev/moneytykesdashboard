import { Search } from "lucide-react";
import { CONTENT_TYPE_OPTIONS } from "./useLessonsLibrary";
import { CreateLessonDropdown, TemplatesButton } from "./CreateLessonControls";

export default function LessonsToolbar({
  subject,
  onSubjectChange,
  subjectOptions,
  contentType,
  onContentTypeChange,
  search,
  onSearchChange,
  navigate,
  setToast
}) {
  return (
    <div className="lessons-toolbar-card">
      <label className="ll-field">
        <span className="sr-only">Subject</span>
        <select
          value={subject}
          onChange={event => onSubjectChange(event.target.value)}
          aria-label="Filter by subject"
        >
          <option value="All Subjects">All Subjects</option>
          {subjectOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="ll-field">
        <span className="sr-only">Content type</span>
        <select
          value={contentType}
          onChange={event => onContentTypeChange(event.target.value)}
          aria-label="Filter by content type"
        >
          {CONTENT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="ll-search">
        <Search size={15} aria-hidden="true" />
        <input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search lessons..."
          aria-label="Search lessons"
        />
      </label>

      <TemplatesButton />
      <CreateLessonDropdown navigate={navigate} setToast={setToast} />
    </div>
  );
}
