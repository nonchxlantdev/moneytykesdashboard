import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import CalendarMonthNav from "./CalendarMonthNav";
import renderEventChip from "./renderEventChip";

/**
 * FullCalendar engine wrapped in the school-planner paper-card chrome.
 * Our CalendarEvent model stays the source of truth — only mapped here for render.
 */
export default function CalendarGrid({
  events = [],
  activeView = "dayGridMonth",
  focusDate,
  onDateClick,
  onEventChipClick
}) {
  const calendarRef = useRef(null);
  const [viewTitle, setViewTitle] = useState("");

  const fullCalendarEvents = useMemo(
    () =>
      events.map(e => ({
        id: String(e.id),
        title: e.title,
        start: e.time ? `${e.date}T${e.time}` : e.date,
        allDay: !e.time,
        extendedProps: {
          type: e.type,
          scope: e.scope,
          classId: e.classId,
          notes: e.notes,
          location: e.location
        }
      })),
    [events]
  );

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (api.view.type !== activeView) {
      api.changeView(activeView);
    }
  }, [activeView]);

  useEffect(() => {
    if (!focusDate) return;
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(focusDate);
  }, [focusDate]);

  const onPrev = () => calendarRef.current?.getApi().prev();
  const onNext = () => calendarRef.current?.getApi().next();

  return (
    <article className="cal-grid-card">
      <CalendarMonthNav onPrev={onPrev} onNext={onNext} title={viewTitle} />

      <div className={`cal-fc-wrap${activeView === "timeGridWeek" ? " is-week" : ""}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={activeView}
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          allDaySlot
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          expandRows
          nowIndicator
          datesSet={arg => setViewTitle(arg.view.title)}
          dayCellContent={arg => (
            <span className="day-num">{String(arg.dayNumberText).replace(".", "")}</span>
          )}
          dayCellClassNames={() => "cal-day"}
          dayHeaderContent={arg => {
            if (activeView !== "timeGridWeek") return true;
            const date = arg.date;
            return (
              <span className="cal-week-header">
                <span className="cal-week-dow">
                  {date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className={`day-num${arg.isToday ? " is-today" : ""}`}>
                  {date.getDate()}
                </span>
              </span>
            );
          }}
          events={fullCalendarEvents}
          eventContent={arg => renderEventChip(arg, onEventChipClick)}
          dayMaxEvents={3}
          moreLinkContent={arg => `+${arg.num} more`}
          dateClick={arg => onDateClick?.(arg.dateStr.slice(0, 10), arg.jsEvent)}
          eventClick={arg => {
            arg.jsEvent.preventDefault();
            arg.jsEvent.stopPropagation();
            onEventChipClick?.(String(arg.event.id), arg.jsEvent);
          }}
        />
      </div>
    </article>
  );
}
