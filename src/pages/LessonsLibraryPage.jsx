import LessonsLibrary from "../components/LessonsLibrary/LessonsLibrary";

/**
 * Lessons library page shell — keeps the existing route import stable.
 * @param {{ setToast: (msg: string) => void, navigate: (view: string) => void }} props
 */
export default function LessonsLibraryPage({ setToast, navigate }) {
  return <LessonsLibrary setToast={setToast} navigate={navigate} />;
}
