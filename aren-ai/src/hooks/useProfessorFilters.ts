import { useState, useEffect } from "react";

const STORAGE_KEYS = {
  GRADE: "professor_selected_grade",
  SECTION: "professor_selected_section",
  SUBJECT: "professor_selected_subject",
};

const EVENT_NAME = "professor-filters-changed";

export const useProfessorFilters = () => {
  // Initialize state from localStorage
  const getStoredGrade = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.GRADE);
    return saved ? parseInt(saved, 10) : 9;
  };

  const getStoredSection = () => {
    return localStorage.getItem(STORAGE_KEYS.SECTION) || "1";
  };

  const getStoredSubject = () => {
    return localStorage.getItem(STORAGE_KEYS.SUBJECT) || "Math";
  };

  const [selectedGrade, setGradeState] = useState<number>(getStoredGrade);
  const [selectedSection, setSectionState] = useState<string>(getStoredSection);
  const [selectedSubject, setSubjectState] = useState<string>(getStoredSubject);

  // Listen for changes from other components (since Ionic caches pages)
  useEffect(() => {
    const handleStorageChange = () => {
      setGradeState(getStoredGrade());
      setSectionState(getStoredSection());
      setSubjectState(getStoredSubject());
    };

    window.addEventListener(EVENT_NAME, handleStorageChange);
    // Also listen to storage event for multi-tab sync (optional but good)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Update localStorage and dispatch event when state changes
  const setSelectedGrade = (grade: number) => {
    localStorage.setItem(STORAGE_KEYS.GRADE, grade.toString());
    setGradeState(grade);
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  const setSelectedSection = (section: string) => {
    localStorage.setItem(STORAGE_KEYS.SECTION, section);
    setSectionState(section);
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  const setSelectedSubject = (subject: string) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECT, subject);
    setSubjectState(subject);
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  return {
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedSubject,
    setSelectedSubject,
  };
};
