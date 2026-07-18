import { LayoutGrid, List } from "lucide-react";
import { STATUS_TABS } from "./useLessonsLibrary";

export default function LessonTabs({ activeTab, onTabChange, viewMode, onViewModeChange }) {
  return (
    <div className="lesson-tabs-row">
      <div className="filter-pills lesson-tabs" role="tablist" aria-label="Lesson status">
        {STATUS_TABS.map(label => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={activeTab === label}
            className={activeTab === label ? "pill active" : "pill"}
            onClick={() => onTabChange(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="view-toggle" role="group" aria-label="View mode">
        <button
          type="button"
          className={viewMode === "grid" ? "view-btn active" : "view-btn"}
          aria-pressed={viewMode === "grid"}
          aria-label="Grid view"
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          className={viewMode === "list" ? "view-btn active" : "view-btn"}
          aria-pressed={viewMode === "list"}
          aria-label="List view"
          onClick={() => onViewModeChange("list")}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}
