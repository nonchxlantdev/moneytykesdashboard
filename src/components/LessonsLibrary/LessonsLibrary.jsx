import { useState } from "react";
import { Check, Library, Pencil, Users } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import StatCard from "../shared/StatCard";
import DeleteLessonModal from "./DeleteLessonModal";
import LessonCard from "./LessonCard";
import LessonList from "./LessonList";
import LessonsEmptyState from "./LessonsEmptyState";
import LessonsToolbar from "./LessonsToolbar";
import LessonTabs from "./LessonTabs";
import PresentationMode from "./PresentationMode";
import useLessonsLibrary from "./useLessonsLibrary";
import "./lessons-library.css";

export default function LessonsLibrary({ setToast, navigate }) {
  const lib = useLessonsLibrary();
  const [session, setSession] = useState(null); // { lesson, mode: "live" | "preview" }

  function handleEdit(lesson) {
    lib.editInStudio(lesson);
    navigate?.("create-lessons");
  }

  function handleDuplicate(lesson) {
    lib.duplicateLesson(lesson);
    setToast?.("Lesson duplicated.");
  }

  function handleDeleteConfirm(lessonId) {
    const result = lib.confirmDelete(lessonId);
    if (result.ok) {
      setToast?.("Lesson deleted.");
    } else {
      setToast?.("Could not delete lesson — please try again.");
    }
  }

  function handlePreview(lesson) {
    setSession({ lesson, mode: "preview" });
  }

  function handleStartLesson(lesson) {
    setSession({ lesson, mode: "live" });
  }

  function handlePresentComplete(lesson) {
    lib.markCompleted(lesson);
    setToast?.("Lesson marked as completed.");
  }

  return (
    <div className="lessons-lib">
      <PageChalkBanner
        eyebrow="Teaching Content"
        title="Lessons Library"
        subtitle="Browse and manage learning content for your students."
      />

      <div className="lessons-lib-body">
        <section className="stats-row lessons-stats" aria-label="Lessons summary">
          <StatCard
            label="TOTAL LESSONS"
            value={lib.stats.total}
            foot="In your library"
            icon={Library}
            tone="total"
          />
          <StatCard
            label="PUBLISHED"
            value={lib.stats.published}
            foot="Ready for class"
            icon={Users}
            tone="published"
          />
          <StatCard
            label="COMPLETED"
            value={lib.stats.completed}
            foot="Finished lessons"
            icon={Check}
            tone="completed"
          />
          <StatCard
            label="INACTIVE"
            value={lib.stats.inactive}
            foot="Not published yet"
            icon={Pencil}
            tone="inactive"
          />
        </section>

        <LessonsToolbar
          subject={lib.subjectFilter}
          onSubjectChange={lib.setSubjectFilter}
          subjectOptions={lib.subjectOptions}
          contentType={lib.contentType}
          onContentTypeChange={lib.setContentType}
          search={lib.query}
          onSearchChange={lib.setQuery}
          navigate={navigate}
          setToast={setToast}
        />

        <LessonTabs
          activeTab={lib.activeTab}
          onTabChange={lib.setActiveTab}
          viewMode={lib.viewMode}
          onViewModeChange={lib.setViewMode}
        />

        {lib.filteredLessons.length ? (
          lib.viewMode === "list" ? (
            <LessonList
              lessons={lib.filteredLessons}
              onStartLesson={handleStartLesson}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              favorites={lib.favorites}
              onToggleFavorite={lib.toggleFavorite}
              onDeleteRequest={lib.requestDelete}
            />
          ) : (
            <div className="lesson-card-grid" aria-label="Lesson cards">
              {lib.filteredLessons.map(lesson => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  viewMode="grid"
                  isFavorite={lib.favorites.includes(lesson.id)}
                  onOpen={() => handlePreview(lesson)}
                  onStartLesson={handleStartLesson}
                  onPreview={handlePreview}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDeleteRequest={lib.requestDelete}
                  onToggleFavorite={lib.toggleFavorite}
                />
              ))}
            </div>
          )
        ) : (
          <LessonsEmptyState />
        )}
      </div>

      <DeleteLessonModal
        lesson={lib.pendingDelete}
        onCancel={lib.cancelDelete}
        onConfirm={handleDeleteConfirm}
      />

      {session ? (
        <PresentationMode
          lesson={session.lesson}
          isPreview={session.mode === "preview"}
          onClose={() => setSession(null)}
          onComplete={handlePresentComplete}
        />
      ) : null}
    </div>
  );
}
