import LessonStudio from "../components/LessonStudio/LessonStudio";

/**
 * Create Lessons page shell — keeps the existing route import stable.
 * @param {{ db?: object, setToast: (msg: string) => void, navigate: (view: string) => void }} props
 */
export default function CreateLessonsPage({ setToast, navigate }) {
  return <LessonStudio setToast={setToast} navigate={navigate} />;
}
