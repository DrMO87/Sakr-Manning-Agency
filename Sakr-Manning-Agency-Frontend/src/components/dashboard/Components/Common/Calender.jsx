import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const customEnUS = {
  ...enUS,
  options: {
    ...enUS.options,
    weekStartsOn: 6, // 6 represents Saturday
  },
};

const locales = {
  "en-US": customEnUS,
};

const myStartOfWeek = (date, options) => {
  return startOfWeek(date, { ...options, weekStartsOn: 6 });
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: myStartOfWeek,
  getDay,
  locales,
});

/**
 * Advanced Interview Calendar Component
 */
const InterviewCalendar = ({
  interviews = [],
  onDateClick,
  onInterviewClick,
}) => {
  const [currentView, setCurrentView] = useState("month");

  // Map interviews to calendar events
  const events = useMemo(() => {
    return interviews.map((interview) => {
      // Parse "YYYY-MM-DD" and "HH:MM"
      const [year, month, day] = interview.date.split("-");
      const [hours, minutes] = (interview.time || "09:00").split(":");
      
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour

      return {
        id: interview.id,
        title: interview.candidateName || "Interview",
        start,
        end,
        resource: interview,
        type: interview.type,
      };
    });
  }, [interviews]);

  // Custom event styles
  const eventStyleGetter = (event) => {
    let backgroundColor = "#6B7280"; // Gray default
    
    switch (event.type?.toLowerCase()) {
      case "video":
        backgroundColor = "#3B82F6"; // Blue
        break;
      case "phone":
        backgroundColor = "#F59E0B"; // Amber
        break;
      case "in-person":
        backgroundColor = "#10B981"; // Emerald
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 1,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "12px",
        padding: "4px 8px",
        fontWeight: "500",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      },
    };
  };

  const handleSelectSlot = ({ start }) => {
    if (onDateClick) {
      // Pass the selected date back as string YYYY-MM-DD
      const dateString = format(start, "yyyy-MM-dd");
      onDateClick(dateString);
    }
  };

  const handleSelectEvent = (event) => {
    if (onInterviewClick) {
      onInterviewClick(event.resource);
    }
  };

  const CustomDateHeader = ({ date, label }) => {
    // Find all events that fall on this date
    const dayEvents = events.filter((e) => isSameDay(e.start, date));
    return (
      <div className="flex flex-col w-full h-full p-1 cursor-pointer" onClick={() => handleSelectSlot({ start: date })}>
        <div className="text-right flex-1 rbc-button-link font-medium text-sm">{label}</div>
        <div className="flex flex-wrap gap-1 mt-1 justify-end max-w-full">
          {dayEvents.map((e) => {
            let bgColor = "#6B7280"; // default gray
            switch (e.type?.toLowerCase()) {
              case "video":
                bgColor = "#3B82F6"; // blue
                break;
              case "phone":
                bgColor = "#F59E0B"; // amber
                break;
              case "in-person":
                bgColor = "#10B981"; // emerald
                break;
            }
            const initial = e.title ? e.title.charAt(0).toUpperCase() : "I";
            return (
              <div
                key={e.id}
                className="w-8 h-8 flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform text-sm font-bold text-white cursor-pointer"
                style={{ backgroundColor: bgColor }}
                title={`${e.title} - ${e.resource?.time || e.type || 'Interview'}`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleSelectEvent(e);
                }}
              >
                {initial}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all calendar-container">
      {/* 
        We use a wrapper to inject global tailwind overrides 
        for react-big-calendar to make it look modern.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-container .rbc-calendar {
          font-family: 'Inter', sans-serif;
        }
        .calendar-container .rbc-header {
          padding: 12px 0;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .calendar-container .rbc-month-view,
        .calendar-container .rbc-time-view,
        .calendar-container .rbc-agenda-view {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          background-color: #ffffff;
        }
        .calendar-container .rbc-day-bg + .rbc-day-bg,
        .calendar-container .rbc-month-row + .rbc-month-row,
        .calendar-container .rbc-header + .rbc-header {
          border-color: #f1f5f9;
        }
        .calendar-container .rbc-today {
          background-color: #f8fafc;
        }
        .calendar-container .rbc-toolbar {
          margin-bottom: 20px;
        }
        .calendar-container .rbc-toolbar button {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 16px;
          margin-right: 8px;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .calendar-container .rbc-toolbar button:active,
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #10B981;
          color: white;
          border-color: #10B981;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        }
        .calendar-container .rbc-toolbar button:hover:not(.rbc-active) {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }
        .calendar-container .rbc-event {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          margin: 2px 4px !important;
        }
        .calendar-container .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          z-index: 5;
        }
        .calendar-container .rbc-date-cell {
          font-weight: 500;
          padding: 8px;
          color: #334155;
        }
        .calendar-container .rbc-off-range {
          color: #94a3b8;
        }
        /* Custom +X More link styling */
        .calendar-container .rbc-show-more {
          background-color: #f1f5f9;
          color: #3b82f6;
          font-weight: 600;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          margin: 2px 4px;
          display: inline-block;
          transition: all 0.2s;
        }
        .calendar-container .rbc-show-more:hover {
          background-color: #e2e8f0;
          color: #2563eb;
        }
        /* Dark mode overrides */
        .dark .calendar-container .rbc-month-view,
        .dark .calendar-container .rbc-time-view,
        .dark .calendar-container .rbc-agenda-view {
          background-color: #0f172a;
          border-color: #1e293b;
        }
        .dark .calendar-container .rbc-header {
          border-color: #1e293b;
          color: #f8fafc !important;
        }
        .dark .calendar-container .rbc-day-bg + .rbc-day-bg,
        .dark .calendar-container .rbc-month-row + .rbc-month-row,
        .dark .calendar-container .rbc-header + .rbc-header {
          border-color: #1e293b;
        }
        .dark .calendar-container .rbc-today {
          background-color: #1e293b;
        }
        .dark .calendar-container .rbc-toolbar button {
          background: #1e293b;
          border-color: #334155;
          color: #cbd5e1;
          box-shadow: none;
        }
        .dark .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #10B981;
          border-color: #10B981;
          color: white;
        }
        .dark .calendar-container .rbc-toolbar button:hover:not(.rbc-active) {
          background-color: #334155;
          border-color: #475569;
        }
        .dark .calendar-container .rbc-off-range-bg {
          background: #020617;
        }
        .dark .calendar-container .rbc-date-cell {
          color: #f8fafc;
        }
        .dark .calendar-container .rbc-button-link {
          color: #f8fafc;
        }
        .dark .calendar-container .rbc-off-range,
        .dark .calendar-container .rbc-off-range .rbc-button-link {
          color: #475569;
        }
        .dark .calendar-container .rbc-toolbar-label {
          color: #f8fafc;
          font-weight: 600;
        }
        .dark .calendar-container .rbc-time-gutter .rbc-timeslot-group {
          color: #94a3b8;
        }
        .dark .calendar-container .rbc-show-more {
          background-color: #1e293b;
          color: #60a5fa;
        }
        .dark .calendar-container .rbc-show-more:hover {
          background-color: #334155;
          color: #93c5fd;
        }
      `}} />

      <Calendar
        localizer={localizer}
        events={currentView === "month" ? [] : events}
        view={currentView}
        onView={setCurrentView}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 650 }}
        views={['month', 'week', 'day']}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        components={{
          month: {
            dateHeader: CustomDateHeader,
          },
          event: ({ event }) => (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold">{event.title}</span>
            </div>
          )
        }}
      />
    </div>
  );
};

export default InterviewCalendar;
