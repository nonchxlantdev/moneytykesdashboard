import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, Layers, Plus, TrendingUp } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import ClassSelector from "../shared/ClassSelector";
import StatCard from "../shared/StatCard";
import EmptyBox from "../shared/EmptyBox";
import Select from "../ui/Select";
import { Button } from "@/components/base/buttons/button";
import GradeGrid from "./GradeGrid";
import GradeMobileList from "./GradeMobileList";
import AddGradeItemModal from "./AddGradeItemModal";
import GroupScoreModal from "./GroupScoreModal";
import {
  currentSchoolYear,
  ensureClassRosterCards,
  getTemplateForSchool,
  resolveClassSections,
  slugClassId,
  upsertReportCards
} from "../../utils/reportCardsStorage";
import {
  deleteGradeItem,
  getCategoriesForSchool,
  getEntriesForItem,
  getItemsForClassSubjectTerm,
  getLetterScaleForSchool,
  syncReportCardTermScoresForStudents,
  upsertGradeEntry,
  upsertGradeItem,
  upsertGroupEntries
} from "../../utils/gradesStorage";
import { computeTermScore, letterForPercent } from "../../utils/gradeCalc";
import { formatPercent } from "../../utils/reportCardScores";
import "./grades.css";

export default function GradesPage({ db, setToast, navigate }) {
  const students = db.students || [];
  const schools = db.schools || [];
  const school = schools[0] || { id: "default", name: db.school || "MoneyTykes School" };
  const template = getTemplateForSchool(school.id, school);
  const classSections = useMemo(() => resolveClassSections(students, db), [students, db]);
  const categories = useMemo(() => getCategoriesForSchool(school.id), [school.id]);
  const letterScale = useMemo(() => getLetterScaleForSchool(school.id), [school.id]);

  const [classId, setClassId] = useState(String(classSections[0]?.id || ""));
  const [subjectName, setSubjectName] = useState(template.subjects?.[0]?.name || "Financial Literacy");
  const [term, setTerm] = useState(template.terms?.[0] || "1st Term");
  const [schoolYear, setSchoolYear] = useState(currentSchoolYear());
  const [tick, setTick] = useState(0);
  const [addingItem, setAddingItem] = useState(false);
  const [groupItem, setGroupItem] = useState(null);

  const classSection = classSections.find(item => String(item.id) === String(classId)) || classSections[0];

  const classStudents = useMemo(() => {
    if (!classSection) return [];
    const matched = students.filter(
      student =>
        slugClassId(student.classLabel || classSection.name) === String(classSection.id) ||
        student.classLabel === classSection.name
    );
    return (
      matched.length
        ? matched
        : students.filter(student => !student.classLabel || student.classLabel === classSection.name)
    ).sort((a, b) => `${a.last} ${a.first}`.localeCompare(`${b.last} ${b.first}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, classSection, tick]);

  const items = useMemo(() => {
    if (!classSection) return [];
    return getItemsForClassSubjectTerm({
      classId: classSection.id,
      subjectName,
      term
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSection, subjectName, term, tick]);

  const entriesByItem = useMemo(() => {
    const map = {};
    items.forEach(item => {
      map[String(item.id)] = getEntriesForItem(item.id);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, tick]);

  const allEntries = useMemo(() => Object.values(entriesByItem).flat(), [entriesByItem]);

  const snapshot = useMemo(() => {
    const missing = allEntries.filter(entry => entry.status === "missing").length;
    const blanks =
      classStudents.length * items.length -
      allEntries.filter(entry => entry.status === "graded" || entry.status === "late" || entry.status === "excused" || entry.status === "missing")
        .length;
    const studentScores = classStudents
      .map(student => {
        const studentEntries = allEntries.filter(entry => String(entry.studentId) === String(student.id));
        return computeTermScore({ items, entries: studentEntries, categories });
      })
      .filter(value => value != null && Number.isFinite(Number(value)));
    const classAvg =
      studentScores.length > 0
        ? Math.round((studentScores.reduce((sum, n) => sum + Number(n), 0) / studentScores.length) * 10) / 10
        : null;
    const weightedCats = categories.filter(cat => (Number(cat.weight) || 0) > 0).length;
    return {
      itemCount: items.length,
      missing: missing + Math.max(0, blanks),
      classAvg,
      weightedCats
    };
  }, [allEntries, classStudents, items, categories]);

  function refresh() {
    setTick(value => value + 1);
  }

  function ensureReportCardsExist() {
    if (!classSection) return;
    const all = (template.terms || [term]).flatMap(termName =>
      ensureClassRosterCards({
        students: classStudents,
        classSection,
        schoolYear,
        term: termName,
        template
      })
    );
    upsertReportCards(all);
  }

  function syncStudents(studentIds) {
    if (!classSection) return;
    ensureReportCardsExist();
    syncReportCardTermScoresForStudents({
      studentIds,
      classId: classSection.id,
      subjectName,
      schoolYear,
      schoolId: school.id
    });
  }

  function handleSaveItem(payload) {
    const saved = upsertGradeItem({
      ...payload,
      schoolId: school.id,
      classId: classSection.id,
      subjectName,
      term,
      createdBy: db.teacher?.id || db.teacher?.email || "teacher"
    });
    setAddingItem(false);
    refresh();
    setToast?.(payload.id ? "Grade item updated" : `Added ${saved.title}`);
  }

  function handleDeleteItem(item) {
    if (!window.confirm(`Delete “${item.title}” and all scores for it?`)) return;
    const affected = getEntriesForItem(item.id).map(entry => entry.studentId);
    deleteGradeItem(item.id);
    syncStudents(affected.length ? affected : classStudents.map(student => student.id));
    refresh();
    setToast?.("Grade item deleted");
  }

  function handleEntryChange({ item, student, rawValue, status }) {
    upsertGradeEntry({
      itemId: item.id,
      studentId: student.id,
      rawValue,
      status: status || "graded"
    });
    syncStudents([student.id]);
    refresh();
  }

  function handleGroupScore(rawValue) {
    if (!groupItem) return;
    const ids = groupItem.groupStudentIds || [];
    upsertGroupEntries(groupItem.id, ids, rawValue);
    syncStudents(ids);
    setGroupItem(null);
    refresh();
    setToast?.("Group scores applied");
  }

  return (
    <div className="grades-page">
      <PageChalkBanner
        eyebrow="MAIN"
        title="Grades"
        subtitle="Record quizzes, tests, and projects. Weighted term scores flow into Report Cards automatically."
        tourId="nav-grades"
      />

      <div className="gr-body">
        <div className="stats-row grades-stats">
          <StatCard label="Items this term" value={snapshot.itemCount} foot={term} tone="teal" icon={ClipboardList} />
          <StatCard
            label="Missing grades"
            value={snapshot.missing}
            foot="Ungraded or marked missing"
            tone="orange"
            icon={AlertTriangle}
          />
          <StatCard
            label="Class average"
            value={snapshot.classAvg == null ? "—" : formatPercent(snapshot.classAvg)}
            foot={
              snapshot.classAvg == null
                ? "No scores yet"
                : letterForPercent(snapshot.classAvg, letterScale)
                  ? `Letter ${letterForPercent(snapshot.classAvg, letterScale)}`
                  : "Weighted term mean"
            }
            tone="purple"
            icon={TrendingUp}
          />
          <StatCard
            label="Categories weighted"
            value={snapshot.weightedCats}
            foot="From Admin → Grading"
            tone="blue"
            icon={Layers}
          />
        </div>

        <div className="form-card gr-toolbar">
          <div className="gr-toolbar-class">
            <ClassSelector
              classes={classSections}
              value={classId}
              onChange={value => setClassId(String(value || ""))}
            />
          </div>
          <Select
            label="Subject"
            value={subjectName}
            onChange={value => setSubjectName(String(value))}
            options={(template.subjects || []).map(subject => ({ value: subject.name, label: subject.name }))}
            placeholder="Select subject"
            searchPlaceholder="Search subjects"
            required
            allowClear={false}
          />
          <Select
            label="Term"
            value={term}
            onChange={value => setTerm(String(value))}
            options={(template.terms || []).map(item => ({ value: item, label: item }))}
            placeholder="Select term"
            searchPlaceholder="Search terms"
            required
            allowClear={false}
          />
          <label className="gr-filter-field">
            <span>School year</span>
            <input value={schoolYear} onChange={event => setSchoolYear(event.target.value)} />
          </label>
          <div className="gr-toolbar-actions">
            <Button color="primary" size="md" iconLeading={<Plus data-icon />} onClick={() => setAddingItem(true)}>
              Add item
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyBox
            title="No grade items yet"
            description={`Add a quiz, test, assignment, exam, or project for ${subjectName} · ${term}.`}
            actions={
              <Button color="primary" size="md" iconLeading={<Plus data-icon />} onClick={() => setAddingItem(true)}>
                Add first item
              </Button>
            }
          />
        ) : (
          <>
            <GradeGrid
              students={classStudents}
              items={items}
              categories={categories}
              entriesByItem={entriesByItem}
              onEntryChange={handleEntryChange}
              onDeleteItem={handleDeleteItem}
              onEnterGroupScore={item => setGroupItem(item)}
            />
            <GradeMobileList
              students={classStudents}
              items={items}
              categories={categories}
              entriesByItem={entriesByItem}
              onEntryChange={handleEntryChange}
            />
          </>
        )}
      </div>

      {addingItem ? (
        <AddGradeItemModal
          categories={categories}
          students={classStudents}
          onClose={() => setAddingItem(false)}
          onSave={handleSaveItem}
        />
      ) : null}

      {groupItem ? (
        <GroupScoreModal
          item={groupItem}
          onClose={() => setGroupItem(null)}
          onSave={handleGroupScore}
        />
      ) : null}
    </div>
  );
}
