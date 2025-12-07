import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import './ProfessorMenu.css';

interface ProfessorMenuProps {
  selectedGrade: string;
  selectedSection: string;
  selectedSubject: string;
  onGradeChange: (grade: string) => void;
  onSectionChange: (section: string) => void;
  onSubjectChange: (subject: string) => void;
}

interface DropdownPortalProps {
  children: React.ReactNode;
  triggerRect: DOMRect | null;
  type: string;
  onOptionClick: (type: string, value: string) => void;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({
  children,
  triggerRect,
  type,
  onOptionClick
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !triggerRect) return null;

  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    top: triggerRect.bottom + 4,
    left: triggerRect.left,
    zIndex: 9999,
  };

  // Add the type and onOptionClick to children
  const childrenWithProps = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
        _portalType: type,
        _onOptionClick: onOptionClick
      } as any)
      : child
  );

  return ReactDOM.createPortal(
    <div className={`dropdown-portal ${type}-portal`} style={dropdownStyle}>
      {childrenWithProps}
    </div>,
    document.body
  );
};

interface DropdownOptionsProps {
  children: React.ReactNode;
  _portalType?: string;
  _onOptionClick?: (type: string, value: string) => void;
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({
  children,
  _portalType,
  _onOptionClick
}) => {
  const handleOptionClick = (value: string) => {
    if (_portalType && _onOptionClick) {
      _onOptionClick(_portalType, value);
    }
  };

  const childrenWithClick = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
        _onOptionClick: handleOptionClick
      } as any)
      : child
  );

  return <div className="dropdown-options">{childrenWithClick}</div>;
};

interface DropdownOptionProps {
  children: React.ReactNode;
  onClick?: () => void;
  _onOptionClick?: (value: string) => void;
  value?: string;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({
  children,
  onClick,
  _onOptionClick,
  value
}) => {
  const handleClick = () => {
    if (_onOptionClick && value) {
      _onOptionClick(value);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="dropdown-option" onClick={handleClick}>
      {children}
    </div>
  );
};

const ProfessorMenu: React.FC<ProfessorMenuProps> = ({
  selectedGrade,
  selectedSection,
  selectedSubject,
  onGradeChange,
  onSectionChange,
  onSubjectChange
}) => {
  const { t } = useTranslation();
  const grades = ['7', '8', '9', '10', '11', '12'];
  const sections = ['1', '2', '3', '4'];
  // Map internal values to translation keys
  const subjects = [
    { id: 'Math', label: t('professor.menu.math') },
    { id: 'Science', label: t('professor.menu.science') },
    { id: 'History', label: t('professor.menu.history') }
  ];

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [triggerRects, setTriggerRects] = useState<{ [key: string]: DOMRect | null }>({
    grade: null,
    section: null,
    subject: null
  });

  const gradeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectClick = (type: string) => {
    // Update trigger positions before opening dropdown
    const refs = { grade: gradeRef, section: sectionRef, subject: subjectRef };
    const rect = refs[type as keyof typeof refs]?.current?.getBoundingClientRect() || null;

    setTriggerRects(prev => ({
      ...prev,
      [type]: rect
    }));

    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const handleOptionClick = (type: string, value: string) => {
    console.log(`Option clicked: ${type} - ${value}`); // Debug log

    if (type === 'grade') {
      onGradeChange(value);
    } else if (type === 'section') {
      onSectionChange(value);
    } else if (type === 'subject') {
      onSubjectChange(value);
    }

    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if click is on a dropdown option in portal
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-portal')) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="professor-menu-container" ref={containerRef}>
        <div className="class-selectors">
          {/* Grade Dropdown */}
          <div className="dropdown-wrapper">
            <div
              ref={gradeRef}
              className="dropdown-trigger"
              onClick={() => handleSelectClick('grade')}
            >
              {selectedGrade}
            </div>
          </div>

          <span className="divider">-</span>

          {/* Section Dropdown */}
          <div className="dropdown-wrapper">
            <div
              ref={sectionRef}
              className="dropdown-trigger"
              onClick={() => handleSelectClick('section')}
            >
              {selectedSection}
            </div>
          </div>

          <span className="divider">:</span>

          {/* Subject Dropdown */}
          <div className="dropdown-wrapper">
            <div
              ref={subjectRef}
              className="dropdown-trigger subject-trigger"
              onClick={() => handleSelectClick('subject')}
            >
              {selectedSubject}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Portals */}
      {activeDropdown === 'grade' && (
        <DropdownPortal
          triggerRect={triggerRects.grade}
          type="grade"
          onOptionClick={handleOptionClick}
        >
          <DropdownOptions>
            {grades.map((grade) => (
              <DropdownOption key={grade} value={grade}>
                {grade}
              </DropdownOption>
            ))}
          </DropdownOptions>
        </DropdownPortal>
      )}

      {activeDropdown === 'section' && (
        <DropdownPortal
          triggerRect={triggerRects.section}
          type="section"
          onOptionClick={handleOptionClick}
        >
          <DropdownOptions>
            {sections.map((section) => (
              <DropdownOption key={section} value={section}>
                {section}
              </DropdownOption>
            ))}
          </DropdownOptions>
        </DropdownPortal>
      )}

      {activeDropdown === 'subject' && (
        <DropdownPortal
          triggerRect={triggerRects.subject}
          type="subject"
          onOptionClick={handleOptionClick}
        >
          <DropdownOptions>
            {subjects.map((sub) => (
              <DropdownOption key={sub.id} value={sub.id}>
                {sub.label}
              </DropdownOption>
            ))}
          </DropdownOptions>
        </DropdownPortal>
      )}
    </>
  );
};

export default ProfessorMenu;