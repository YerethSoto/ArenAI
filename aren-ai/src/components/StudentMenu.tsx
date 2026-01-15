import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./StudentMenu.css";

interface StudentMenuProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  variant?: "default" | "header";
  options?: (string | { value: string; label: string })[];
}

interface DropdownPortalProps {
  children: React.ReactNode;
  triggerRect: DOMRect | null;
  type: string;
  onOptionClick: (type: string, value: string) => void;
  portalClass?: string;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({
  children,
  triggerRect,
  type,
  onOptionClick,
  portalClass,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !triggerRect) return null;

  const dropdownStyle: React.CSSProperties = {
    position: "fixed",
    top: triggerRect.bottom + 4,
    left: triggerRect.left,
    zIndex: 9999,
  };

  // Add the type and onOptionClick to children
  const childrenWithProps = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
          _portalType: type,
          _onOptionClick: onOptionClick,
        } as any)
      : child
  );

  return ReactDOM.createPortal(
    <div
      className={`dropdown-portal ${type}-portal ${portalClass || ""}`}
      style={dropdownStyle}
    >
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
  _onOptionClick,
}) => {
  const handleOptionClick = (value: string) => {
    if (_portalType && _onOptionClick) {
      _onOptionClick(_portalType, value);
    }
  };

  const childrenWithClick = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
          _onOptionClick: handleOptionClick,
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
  value,
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

const StudentMenu: React.FC<StudentMenuProps> = ({
  selectedSubject,
  onSubjectChange,
  variant = "default",
  options,
}) => {
  const subjects = ["Math", "Science", "Social Studies", "Spanish"];
  const menuItems = options || subjects;

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const subjectRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectClick = (type: string) => {
    // Update trigger position before opening dropdown
    const rect = subjectRef.current?.getBoundingClientRect() || null;

    setTriggerRect(rect);
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const handleOptionClick = (type: string, value: string) => {
    if (type === "subject") {
      onSubjectChange(value);
    }
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Check if click is on a dropdown option in portal
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-portal")) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div
        className={`student-menu-container ${
          variant === "header" ? "header-variant" : ""
        }`}
        ref={containerRef}
      >
        <div className="subject-selector">
          {/* Subject Dropdown */}
          <div className="dropdown-wrapper">
            <div
              ref={subjectRef}
              className="dropdown-trigger subject-trigger"
              onClick={() => handleSelectClick("subject")}
            >
              {selectedSubject}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Portal */}
      {activeDropdown === "subject" && (
        <DropdownPortal
          triggerRect={triggerRect}
          type="subject"
          onOptionClick={handleOptionClick}
          portalClass={variant === "header" ? "header-variant" : ""}
        >
          <DropdownOptions>
            {menuItems.map((item) => {
              const val = typeof item === "string" ? item : item.value;
              const lab = typeof item === "string" ? item : item.label;
              return (
                <DropdownOption key={val} value={val}>
                  {lab}
                </DropdownOption>
              );
            })}
          </DropdownOptions>
        </DropdownPortal>
      )}
    </>
  );
};

export default StudentMenu;
