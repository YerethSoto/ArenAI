import React from "react";
import "./StudentMenu.css";

interface StudentMenuProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = ["Math", "Science", "History", "Language", "Art"];

const StudentMenu: React.FC<StudentMenuProps> = ({
  selectedSubject,
  onSubjectChange,
}) => {
  return (
    <div className="student-menu">
      {subjects.map((subject) => (
        <button
          key={subject}
          className={`student-menu-btn${selectedSubject === subject ? " active" : ""}`}
          onClick={() => onSubjectChange(subject)}
        >
          {subject}
        </button>
      ))}
    </div>
  );
};

export default StudentMenu;