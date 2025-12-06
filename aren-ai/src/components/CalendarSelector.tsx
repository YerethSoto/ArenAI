import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { chevronBack, chevronForward } from "ionicons/icons";
import "./CalendarSelector.css";

interface CalendarSelectorProps {
  onDateSelect?: (date: Date) => void;
  title?: string;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onDateSelect,
  title = "Class Schedule",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    generateWeek(currentDate);
  }, [currentDate]);

  const generateWeek = (baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    // Adjust to start on Sunday (0)
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    setWeekDates(week);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-selector-container">
      {/* Top Header: Title */}
      <div className="cs-top-header">
        <div className="cs-subject-pill">{title}</div>
      </div>

      {/* Month Navigation */}
      <div className="cs-month-nav">
        <div className="cs-nav-btn" onClick={handlePrevWeek}>
          <IonIcon icon={chevronBack} />
        </div>
        <span className="cs-month-year">{formatMonthYear(currentDate)}</span>
        <div className="cs-nav-btn" onClick={handleNextWeek}>
          <IonIcon icon={chevronForward} />
        </div>
      </div>

      {/* Calendar Body */}
      <div className="cs-body">
        <div className="cs-days-row">
          {days.map((day) => (
            <div key={day} className="cs-day-label">
              {day}
            </div>
          ))}
        </div>
        <div className="cs-dates-row">
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`cs-date-cell ${isSelected(date) ? "selected" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              {date.getDate()}
              {isSelected(date) && <div className="cs-dot"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { CalendarSelector };
