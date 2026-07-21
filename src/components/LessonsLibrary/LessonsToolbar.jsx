import { Search } from "lucide-react";
import Select from "../ui/Select";
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
      <div className="ll-field">
        <Select
          aria-label="Filter by subject"
          value={subject}
          onChange={onSubjectChange}
          options={[
            { value: "All Subjects", label: "All Subjects" },
            ...subjectOptions.map(option => ({ value: option, label: option }))
          ]}
          searchPlaceholder="Search subjects"
          allowClear={false}
        />
      </div>

      <div className="ll-field">
        <Select
          aria-label="Filter by content type"
          value={contentType}
          onChange={onContentTypeChange}
          options={CONTENT_TYPE_OPTIONS.map(option => ({
            value: option.value,
            label: option.label
          }))}
          searchPlaceholder="Search types"
          allowClear={false}
        />
      </div>

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
