import { Library } from "lucide-react";
import EmptyBox from "../shared/EmptyBox";

export default function LessonsEmptyState() {
  return (
    <div className="lessons-empty">
      <Library className="empty-icon" size={28} strokeWidth={1.75} aria-hidden="true" />
      <EmptyBox
        title="No lessons in your library yet"
        description="Videos, documents, and presentations you add will appear here."
      />
    </div>
  );
}
