import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  CREATED_LESSONS_KEY,
  LESSON_CREATE_TYPE_KEY,
  LESSON_STUDIO_EDIT_KEY,
  resolveLessonType,
  saveCreatedLessons
} from "../../utils/lessonsStorage";
import { storeLessonFile } from "../../utils/lessonFileStorage";
import { fetchYoutubeOEmbed, isValidYoutubeUrl, youtubeThumbnail } from "../../utils/youtube";
import { TEMP_SUBJECT_OPTIONS } from "../LessonsLibrary/useLessonsLibrary";
import { validateLessonPlan } from "./LessonPlanFields";
import { isBlankRichText } from "./NotesRichEditor";

const EMPTY_FORM = {
  type: "plan",
  title: "",
  subject: "Financial Literacy",
  status: "draft",
  isFavorite: false,
  sourceValue: "",
  objective: "",
  materials: "",
  activitySteps: "",
  wrapUp: "",
  tags: "",
  videoThumbnailUrl: null,
  durationSeconds: null,
  pageCount: null,
  slideCount: null,
  fileFormat: null,
  fileName: null,
  fileId: null,
  fileMimeType: null,
  fileSize: null
};

function fileMetaFromName(fileName, type) {
  const ext = String(fileName || "")
    .split(".")
    .pop()
    ?.toUpperCase();
  if (type === "document") {
    return {
      fileName,
      fileFormat: ext || "PDF",
      pageCount: null,
      slideCount: null
    };
  }
  return {
    fileName,
    fileFormat: ext || "PPT",
    slideCount: null,
    pageCount: null
  };
}

function lessonToForm(lesson) {
  const type = resolveLessonType(lesson);
  const rawStatus = String(lesson.status || "").toLowerCase();
  const sourceValue =
    type === "video"
      ? lesson.youtubeUrl || lesson.sourceValue || ""
      : lesson.fileName || lesson.sourceValue || "";

  const plan = lesson.lessonPlan || {};
  // Legacy lessons only had a freeform description — treat it as the objective.
  const objective = plan.objective || lesson.objective || lesson.description || "";

  return {
    type,
    title: lesson.title || "",
    subject: lesson.subject || "Financial Literacy",
    status:
      rawStatus === "published"
        ? "published"
        : rawStatus === "completed"
          ? "completed"
          : "draft",
    isFavorite: Boolean(lesson.isFavorite),
    sourceValue,
    objective,
    materials: plan.materials || lesson.materials || "",
    activitySteps: plan.activitySteps || lesson.activitySteps || "",
    wrapUp: plan.wrapUp || lesson.wrapUp || "",
    tags: Array.isArray(lesson.tags) ? lesson.tags.join(", ") : lesson.tags || "",
    videoThumbnailUrl:
      lesson.videoThumbnailUrl ||
      lesson.thumbnail ||
      (lesson.youtubeUrl ? youtubeThumbnail(lesson.youtubeUrl) : null),
    durationSeconds: lesson.durationSeconds ?? null,
    pageCount: lesson.pageCount ?? null,
    slideCount: lesson.slideCount ?? null,
    fileFormat: lesson.fileFormat || null,
    fileName: lesson.fileName || null,
    fileId: lesson.fileId || null,
    fileMimeType: lesson.fileMimeType || null,
    fileSize: lesson.fileSize ?? null
  };
}

/**
 * Single source of truth for Lesson Studio form + live preview data.
 */
export default function useLessonStudioForm() {
  const [lessons, setLessons] = useLocalStorage(CREATED_LESSONS_KEY, []);
  const [data, setData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");
  const [isStoringFile, setIsStoringFile] = useState(false);
  const [planErrors, setPlanErrors] = useState({});
  const [hydrated, setHydrated] = useState(false);

  const update = patch => {
    setData(current => ({ ...current, ...patch }));
    // Clear field-level publish errors as the teacher edits those fields
    setPlanErrors(current => {
      const next = { ...current };
      Object.keys(patch).forEach(key => {
        if (key in next) delete next[key];
      });
      return next;
    });
  };

  const subjectOptions = useMemo(() => {
    const fromLessons = lessons.map(lesson => lesson.subject).filter(Boolean);
    return [...new Set([...TEMP_SUBJECT_OPTIONS, ...fromLessons])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [lessons]);

  const previewLesson = useMemo(() => {
    const statusLabel =
      data.status === "published"
        ? "Published"
        : data.status === "completed"
          ? "Completed"
          : "Inactive";
    return {
      id: "preview",
      type: data.type,
      title: data.title.trim() || "Untitled Lesson",
      subject: data.subject || "General",
      description:
        data.objective.trim() ||
        "Your curriculum or description will appear here as you type.",
      status: data.status,
      statusLabel,
      isFavorite: data.isFavorite,
      assignedCount: 0,
      videoThumbnailUrl: data.type === "video" ? data.videoThumbnailUrl : undefined,
      durationSeconds: data.type === "video" ? data.durationSeconds : undefined,
      pageCount: data.type === "document" ? data.pageCount : undefined,
      fileFormat:
        data.type === "document" || data.type === "presentation"
          ? data.fileFormat
          : undefined,
      slideCount: data.type === "presentation" ? data.slideCount : undefined,
      libraryStatus: statusLabel
    };
  }, [data]);

  useEffect(() => {
    if (hydrated) return;

    try {
      const pendingId = sessionStorage.getItem(LESSON_STUDIO_EDIT_KEY);
      if (pendingId) {
        sessionStorage.removeItem(LESSON_STUDIO_EDIT_KEY);
        const lesson = lessons.find(item => String(item.id) === pendingId);
        if (lesson) {
          setEditingId(lesson.id);
          setData(lessonToForm(lesson));
          setHydrated(true);
          return;
        }
      }

      const createType = sessionStorage.getItem(LESSON_CREATE_TYPE_KEY);
      if (createType) {
        sessionStorage.removeItem(LESSON_CREATE_TYPE_KEY);
        if (createType === "video" || createType === "document" || createType === "presentation" || createType === "plan") {
          setData(current => ({ ...EMPTY_FORM, type: createType, subject: current.subject }));
        }
      }
    } catch {
      /* ignore */
    }

    setHydrated(true);
  }, [hydrated, lessons]);

  useEffect(() => {
    if (data.type !== "video") {
      setUrlError("");
      return undefined;
    }

    const url = data.sourceValue.trim();
    if (!url) {
      setUrlError("");
      update({ videoThumbnailUrl: null, durationSeconds: null });
      return undefined;
    }

    if (!isValidYoutubeUrl(url)) {
      setUrlError("Enter a valid YouTube URL.");
      update({ videoThumbnailUrl: null, durationSeconds: null });
      return undefined;
    }

    setUrlError("");
    const thumb = youtubeThumbnail(url);
    update({ videoThumbnailUrl: thumb });

    let cancelled = false;
    fetchYoutubeOEmbed(url).then(meta => {
      if (cancelled || !meta) return;
      update({
        videoThumbnailUrl: meta.thumbnailUrl || thumb,
        ...(meta.title && !data.title.trim() ? { title: meta.title } : {})
      });
    });

    return () => {
      cancelled = true;
    };
    // Intentionally depend on sourceValue + type only; title autofill is one-shot when empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.sourceValue, data.type]);

  function selectType(type) {
    update({
      type,
      sourceValue: "",
      videoThumbnailUrl: null,
      durationSeconds: null,
      pageCount: null,
      slideCount: null,
      fileFormat: null,
      fileName: null,
      fileId: null,
      fileMimeType: null,
      fileSize: null
    });
    setUrlError("");
    setFileError("");
  }

  async function setSourceValue(value) {
    if (data.type === "plan") {
      return;
    }

    if (data.type === "video") {
      update({ sourceValue: value });
      return;
    }

    if (value && typeof value === "object" && value.name) {
      const extension = String(value.name).split(".").pop()?.toLowerCase();
      const allowed =
        data.type === "document"
          ? new Set(["pdf"])
          : new Set(["pdf", "ppt", "pptx"]);
      if (!allowed.has(extension)) {
        setFileError(
          data.type === "document"
            ? "Documents must be a PDF. Export from Word or Google Docs as PDF first."
            : "Upload a PDF, PPT, or PPTX file."
        );
        return;
      }

      const maxBytes = data.type === "document" ? 20 * 1024 * 1024 : 30 * 1024 * 1024;
      if (value.size > maxBytes) {
        setFileError(
          `${data.type === "document" ? "Documents" : "Presentations"} must be ${data.type === "document" ? "20" : "30"}MB or smaller.`
        );
        return;
      }

      const meta = fileMetaFromName(value.name, data.type);
      setFileError("");
      setIsStoringFile(true);
      try {
        const stored = await storeLessonFile(value);
        update({
          sourceValue: value.name,
          ...meta,
          ...stored
        });
      } catch {
        setFileError("Could not store this file locally. Please try again.");
      } finally {
        setIsStoringFile(false);
      }
      return;
    }

    update({ sourceValue: String(value || ""), fileName: String(value || "") || null });
  }

  function reset() {
    setEditingId(null);
    setData(EMPTY_FORM);
    setUrlError("");
    setFileError("");
    setIsStoringFile(false);
    setPlanErrors({});
  }

  function validateForPublish() {
    const errors = validateLessonPlan({
      objective: data.objective,
      materials: data.materials,
      activitySteps: data.activitySteps,
      wrapUp: data.wrapUp
    });
    setPlanErrors(errors);
    return errors;
  }

  /**
   * @param {"draft"|"published"|"selected"} mode
   */
  function save(mode) {
    const selectedStatus = mode === "selected" ? data.status : mode;
    const requiresCompleteLesson =
      selectedStatus === "published" || selectedStatus === "completed";

    if (!data.title.trim()) {
      return { ok: false, error: "Lesson title is required." };
    }

    if (data.type === "video" && data.sourceValue.trim() && !isValidYoutubeUrl(data.sourceValue)) {
      return { ok: false, error: "Please enter a valid YouTube URL." };
    }

    if (
      requiresCompleteLesson &&
      (data.type === "document" || data.type === "presentation") &&
      !data.fileId
    ) {
      return {
        ok: false,
        error: `Upload a ${data.type === "document" ? "PDF document" : "presentation"} before publishing.`
      };
    }

    if (isStoringFile) {
      return { ok: false, error: "Please wait for the file to finish saving." };
    }

    if (requiresCompleteLesson && data.type !== "plan") {
      const errors = validateForPublish();
      if (Object.keys(errors).length > 0) {
        return { ok: false, error: "Complete the lesson plan before publishing.", planErrors: errors };
      }
    } else {
      setPlanErrors({});
    }

    const status =
      selectedStatus === "published"
        ? "Published"
        : selectedStatus === "completed"
          ? "Completed"
          : "Inactive";
    const tags = data.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

    const lessonPlan = {
      objective: data.objective.trim(),
      materials: data.materials.trim(),
      activitySteps: isBlankRichText(data.activitySteps) ? "" : String(data.activitySteps).trim(),
      wrapUp: data.wrapUp.trim()
    };

    const payload = {
      type: data.type,
      title: data.title.trim(),
      subject: data.subject,
      // Keep description synced to objective for library card snippets / legacy readers
      description: lessonPlan.objective,
      lessonPlan,
      objective: lessonPlan.objective,
      materials: lessonPlan.materials,
      activitySteps: lessonPlan.activitySteps,
      wrapUp: lessonPlan.wrapUp,
      tags,
      status,
      isFavorite: data.isFavorite,
      youtubeUrl: data.type === "video" ? data.sourceValue.trim() : "",
      thumbnail: data.type === "video" ? data.videoThumbnailUrl || youtubeThumbnail(data.sourceValue) : null,
      videoThumbnailUrl: data.type === "video" ? data.videoThumbnailUrl : null,
      durationSeconds: data.type === "video" ? data.durationSeconds : null,
      pageCount: data.type === "document" ? data.pageCount : null,
      slideCount: data.type === "presentation" ? data.slideCount : null,
      fileFormat:
        data.type === "document" || data.type === "presentation" ? data.fileFormat : null,
      fileName:
        data.type === "document" || data.type === "presentation"
          ? data.fileName || data.sourceValue || null
          : null,
      fileId:
        data.type === "document" || data.type === "presentation" ? data.fileId : null,
      fileMimeType:
        data.type === "document" || data.type === "presentation"
          ? data.fileMimeType
          : null,
      fileSize:
        data.type === "document" || data.type === "presentation" ? data.fileSize : null,
      sourceValue: data.type === "plan" ? "" : data.sourceValue
    };

    if (editingId != null) {
      const nextLessons = lessons.map(item =>
        item.id === editingId
          ? {
              ...item,
              ...payload,
              completedAt:
                status === "Completed"
                  ? item.completedAt || new Date().toISOString()
                  : null
            }
          : item
      );
      // Write sync before navigate — setState updaters can be dropped on unmount.
      saveCreatedLessons(nextLessons);
      setLessons(nextLessons);
      reset();
      return {
        ok: true,
        message:
          mode === "selected"
            ? `Lesson updated as ${status.toLowerCase()}.`
            : status === "Published"
              ? "Lesson updated and published."
              : "Lesson saved as draft."
      };
    }

    const nextLessons = [
      {
        id: Date.now(),
        ...payload,
        assignedCount: 0,
        createdAt: new Date().toISOString(),
        completedAt: status === "Completed" ? new Date().toISOString() : null
      },
      ...lessons
    ];
    saveCreatedLessons(nextLessons);
    setLessons(nextLessons);
    reset();
    return {
      ok: true,
      message:
        status === "Published"
          ? "Lesson published to your library."
          : "Lesson saved as draft."
    };
  }

  return {
    data,
    update,
    selectType,
    setSourceValue,
    previewLesson,
    subjectOptions,
    editingId,
    urlError,
    fileError,
    isStoringFile,
    planErrors,
    setPlanErrors,
    validateForPublish,
    reset,
    save,
    isEditing: editingId != null
  };
}
