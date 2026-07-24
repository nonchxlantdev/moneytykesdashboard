/**
 * Domain migration adapters — call these from feature modules when
 * `isSupabaseEnabled()` is true. localStorage helpers remain the demo fallback.
 *
 * Covered domains (repos in domainRepos.js + migrations):
 * - attendance_records
 * - rewards_bank / points_ledger
 * - calendar_events
 * - lessons (+ Storage lesson-files)
 * - report_card_templates / report_cards
 * - my_day_tasks / my_day_notes / my_day_reflections
 */
export {
  listAttendance,
  upsertAttendanceRows,
  listRewardsBank,
  listRecentPoints,
  listCalendarEvents,
  listLessons,
  listReportCards,
  listMyDayTasks,
  listMyDayNotes,
  upsertMyDayReflection
} from "./domainRepos";
