import PageChalkBanner from "../components/shared/PageChalkBanner";
import EmptyBox from "../components/shared/EmptyBox";
import "./coming-soon.css";

/**
 * Placeholder route for features not built yet.
 */
export default function ComingSoonPage({
  eyebrow = "Coming soon",
  title = "Coming soon",
  lead = "This page is on the way.",
  description = "We're building this section next. Check back soon."
}) {
  return (
    <div className="coming-soon-page">
      <PageChalkBanner eyebrow={eyebrow} title={title} lead={lead} />
      <div className="coming-soon-body">
        <EmptyBox title="Coming soon" description={description} />
      </div>
    </div>
  );
}
