import { Search } from "lucide-react";

export default function RosterToolbar({
  search,
  onSearch,
  sortBy,
  onSort,
  showingCount = 0
}) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={16} aria-hidden="true" />
        <input
          value={search}
          onChange={event => onSearch(event.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
        />
      </div>
      <div className="filter-pills">
        <span className="sort-label">Sort:</span>
        <button
          type="button"
          className={sortBy === "name" ? "pill active" : "pill"}
          onClick={() => onSort("name")}
        >
          Name
        </button>
        <button
          type="button"
          className={sortBy === "points" ? "pill active" : "pill"}
          onClick={() => onSort("points")}
        >
          Points
        </button>
      </div>
      <span className="showing">
        Showing <strong>{showingCount}</strong> student{showingCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
