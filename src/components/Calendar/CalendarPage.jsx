import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarRange, List, Plus } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { normalizeCalendarEvent } from "../../utils/calendarUtils";
import CalendarGrid from "./CalendarGrid";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import CreateEventModal from "./CreateEventModal";
import EventDetailPopover from "./EventDetailPopover";
import UpcomingPanel from "./UpcomingPanel";
import "./calendar.css";

/**
 * School-planner calendar — FullCalendar engine + paper-card chrome + CRUD.
 */
export default function CalendarPage({ db, setToast, focusDate, onFocusHandled }) {
  const [storedEvents, setStoredEvents] = useLocalStorage("calendar_events", []);
  const [activeView, setActiveView] = useState("dayGridMonth");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailAnchor, setDetailAnchor] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [gotoDate, setGotoDate] = useState(null);

  const events = useMemo(
    () => (storedEvents || []).map(normalizeCalendarEvent).filter(Boolean),
    [storedEvents]
  );

  const classes = useMemo(() => {
    const labels = new Set([db?.className, ...(db?.students || []).map(s => s.classLabel).filter(Boolean)]);
    return [...labels].filter(Boolean);
  }, [db?.className, db?.students]);

  useEffect(() => {
    if (!focusDate) return;
    setGotoDate(focusDate);
    setActiveView("dayGridMonth");
    onFocusHandled?.();
  }, [focusDate, onFocusHandled]);

  function openCreate(date) {
    setEditingEvent(null);
    setDefaultDate(date || new Date().toISOString().slice(0, 10));
    setDetailEvent(null);
    setCreateOpen(true);
  }

  function openEdit(event) {
    setEditingEvent(event);
    setDefaultDate(event.date);
    setDetailEvent(null);
    setCreateOpen(true);
  }

  function openEventDetail(event, jsEvent) {
    const rect = jsEvent?.currentTarget?.getBoundingClientRect?.()
      || jsEvent?.target?.getBoundingClientRect?.()
      || null;
    setDetailAnchor(rect);
    setDetailEvent(event);
  }

  function onEventChipClick(eventId, jsEvent) {
    const event = events.find(e => String(e.id) === String(eventId));
    if (event) openEventDetail(event, jsEvent);
  }

  function saveEvent(payload) {
    const normalized = normalizeCalendarEvent({
      ...payload,
      id: editingEvent?.id || Date.now(),
      createdAt: editingEvent?.createdAt || new Date().toISOString()
    });

    setStoredEvents(current => {
      const list = current || [];
      if (editingEvent) {
        return list.map(item => (String(item.id) === String(editingEvent.id) ? normalized : item));
      }
      return [...list, normalized];
    });

    setCreateOpen(false);
    setEditingEvent(null);
    setToast?.(editingEvent ? "Event updated." : "Event created.");
  }

  function confirmDelete(eventId) {
    setStoredEvents(current => (current || []).filter(item => String(item.id) !== String(eventId)));
    setDeleteEvent(null);
    setDetailEvent(null);
    setToast?.("Event deleted.");
  }

  return (
    <div className="cal-planner">
      <PageChalkBanner
        eyebrow="Planning"
        title="School calendar"
        lead="Plan lessons, quizzes, and school events on one paper planner."
        actions={
          <>
            <div className="calendar-view-toggle" role="tablist" aria-label="Calendar view" data-tour="calendar-view-toggle">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "dayGridMonth"}
                className={activeView === "dayGridMonth" ? "active" : ""}
                onClick={() => setActiveView("dayGridMonth")}
              >
                <CalendarDays size={15} /> Month
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "timeGridWeek"}
                className={activeView === "timeGridWeek" ? "active" : ""}
                onClick={() => setActiveView("timeGridWeek")}
              >
                <CalendarRange size={15} /> Week
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "listMonth"}
                className={activeView === "listMonth" ? "active" : ""}
                onClick={() => setActiveView("listMonth")}
              >
                <List size={15} /> List
              </button>
            </div>
            <button
              type="button"
              className="btn primary"
              data-tour="calendar-new-event"
              onClick={() => openCreate()}
            >
              <Plus size={15} /> New event
            </button>
          </>
        }
      />

      <div className="cal-planner-body">
        <div className="cal-planner-main" data-tour="calendar-grid">
          <CalendarGrid
            events={events}
            activeView={activeView}
            focusDate={gotoDate}
            onDateClick={date => openCreate(date)}
            onEventChipClick={onEventChipClick}
          />
        </div>

        <UpcomingPanel
          events={events}
          onCreate={() => openCreate()}
          onSelect={event => {
            setGotoDate(event.date);
            setActiveView("dayGridMonth");
            openEventDetail(event, {
              currentTarget: {
                getBoundingClientRect: () => ({
                  top: 140,
                  bottom: 180,
                  left: window.innerWidth - 360
                })
              }
            });
          }}
        />
      </div>

      <CreateEventModal
        open={createOpen}
        event={editingEvent}
        defaultDate={defaultDate}
        classes={classes}
        defaultClassId={classes[0] || db?.className || ""}
        onClose={() => {
          setCreateOpen(false);
          setEditingEvent(null);
        }}
        onSave={saveEvent}
      />

      <EventDetailPopover
        event={detailEvent}
        anchorRect={detailAnchor}
        onClose={() => setDetailEvent(null)}
        onEdit={openEdit}
        onDelete={event => {
          setDetailEvent(null);
          setDeleteEvent(event);
        }}
      />

      <ConfirmDeleteModal
        event={deleteEvent}
        onCancel={() => setDeleteEvent(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
