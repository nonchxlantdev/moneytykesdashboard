import Badge from "../Badge";

export function StatusBadge({ status, label }) {
  const tone =
    status === "completed" || status === "published"
      ? "success"
      : status === "draft"
        ? "inactive"
        : "teal";
  const text =
    label ||
    (status === "published"
      ? "Published"
      : status === "completed"
        ? "Completed"
        : status === "draft"
          ? "Inactive"
          : status);
  return <Badge tone={tone}>{text}</Badge>;
}

export function TypeBadge({ type }) {
  const tone =
    type === "video"
      ? "rose"
      : type === "document"
        ? "info"
        : type === "presentation"
          ? "warning"
          : type === "plan"
            ? "teal"
            : "default";
  const label =
    type === "video"
      ? "Video"
      : type === "document"
        ? "Document"
        : type === "presentation"
          ? "Slides"
          : type === "plan"
            ? "Curriculum"
            : type;
  return <Badge tone={tone}>{label}</Badge>;
}
