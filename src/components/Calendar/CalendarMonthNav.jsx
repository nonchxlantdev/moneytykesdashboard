import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Custom month nav — drives FullCalendar via prev/next API, not FC's toolbar.
 */
export default function CalendarMonthNav({ onPrev, onNext, title }) {
  return (
    <div className="cal-month-nav">
      <button type="button" className="cal-icon-btn" onClick={onPrev} aria-label="Previous month">
        <ChevronLeft size={18} strokeWidth={2.25} />
      </button>
      <h3>{title}</h3>
      <button type="button" className="cal-icon-btn" onClick={onNext} aria-label="Next month">
        <ChevronRight size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
}
