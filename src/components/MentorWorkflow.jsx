import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Plus, Trash2 } from "lucide-react";
import "./MentorWorkflow.css";

function formatTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function generateTimeSlots(type) {
  const slots = [];
  let startMinutes, endMinutes, interval;
  switch (type) {
    case "standard":
      startMinutes = 8 * 60 + 30;
      endMinutes = 16 * 60 + 30;
      interval = 60;
      break;
    case "extended":
      startMinutes = 10 * 60;
      endMinutes = 19 * 60;
      interval = 60;
      break;
    case "nonInstructional":
      startMinutes = 9 * 60;
      endMinutes = 15 * 60;
      interval = 90;
      break;
    default:
      startMinutes = 8 * 60 + 30;
      endMinutes = 16 * 60 + 30;
      interval = 60;
  }
  for (let min = startMinutes; min + interval <= endMinutes; min += interval) {
    const start = formatTime(min);
    const end = formatTime(min + interval);
    slots.push({ start, end, activity: "" });
  }
  return slots;
}

function MentorWorkflow() {
  const [date, setDate] = useState(new Date());
  const [scheduleType, setScheduleType] = useState("standard");
  const [entries, setEntries] = useState(() => generateTimeSlots("standard"));
  const [editRow, setEditRow] = useState(null);
  const [editField, setEditField] = useState(null);
  const [initialSlotCount, setInitialSlotCount] = useState(generateTimeSlots("standard").length);

  useEffect(() => {
    const slots = generateTimeSlots(scheduleType);
    setEntries(slots);
    setInitialSlotCount(slots.length);
    setEditRow(null);
    setEditField(null);
  }, [scheduleType]);

  const handleCellChange = (idx, field, value) => {
    setEntries((old) => old.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
  };

  const handleAddRow = () => {
    setEntries((old) => [...old, { start: "", end: "", activity: "" }]);
    setEditRow(entries.length);
    setEditField("start");
  };

  const handleDeleteRow = (idx) => {
    setEntries((old) => old.filter((_, i) => i !== idx));
    setEditRow(null);
    setEditField(null);
  };

  const handleSave = () => {
    alert(
      JSON.stringify({ date: format(date, "yyyy-MM-dd"), scheduleType, entries }, null, 2)
    );
  };

  return (
    <div className="mentor-workflow-container">
      <div className="mentor-tabs">
        <button
          className={`mentor-tab${scheduleType === "standard" ? " active" : ""}`}
          onClick={() => setScheduleType("standard")}
        >
          Standard
          <div className="mentor-tab-desc">8:30 AM - 4:30 PM</div>
        </button>
        <button
          className={`mentor-tab${scheduleType === "extended" ? " active" : ""}`}
          onClick={() => setScheduleType("extended")}
        >
          Extended
          <div className="mentor-tab-desc">10:00 AM - 7:00 PM</div>
        </button>
        <button
          className={`mentor-tab${scheduleType === "nonInstructional" ? " active" : ""}`}
          onClick={() => setScheduleType("nonInstructional")}
        >
          Non-Instructional
          <div className="mentor-tab-desc">9:00 AM - 3:00 PM</div>
        </button>
      </div>
      <div className="mentor-date-row">
        <div>
          <label className="mentor-label">Select Date</label>
          <input
            type="date"
            className="mentor-date-input"
            value={format(date, "yyyy-MM-dd")}
            onChange={e => setDate(new Date(e.target.value))}
          />
        </div>
        <span className="mentor-date-info">
          {scheduleType === "standard"
            ? "Standard mentor hours"
            : scheduleType === "extended"
            ? "Extended mentor hours"
            : "Non-Instructional day schedule"}
        </span>
      </div>
      <div className="mentor-table-wrapper">
        <table className="mentor-table">
          <thead>
            <tr>
              <th className="mentor-th">Time</th>
              <th className="mentor-th">Activity</th>
              <th className="mentor-th" style={{width: 40}}></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={idx}
                className={`mentor-tr${editRow === idx ? " editing" : ""}`}
              >
                <td
                  className="mentor-td mentor-td-time"
                  onClick={() => {
                    setEditRow(idx);
                    setEditField("start");
                  }}
                >
                  {editRow === idx && (editField === "start" || editField === "end") ? (
                    <div className="mentor-time-edit">
                      <input
                        className="mentor-time-input"
                        value={entry.start}
                        autoFocus={editField === "start"}
                        onBlur={() => {
                          if (editField === "end" || !entry.end) {
                            setEditRow(null);
                            setEditField(null);
                          }
                        }}
                        onChange={e => handleCellChange(idx, "start", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Tab") {
                            setEditField("end");
                          } else if (e.key === "Enter") {
                            setEditRow(null);
                            setEditField(null);
                          }
                        }}
                        placeholder="Start"
                      />
                      <span>-</span>
                      <input
                        className="mentor-time-input"
                        value={entry.end}
                        autoFocus={editField === "end"}
                        onBlur={() => {
                          setEditRow(null);
                          setEditField(null);
                        }}
                        onChange={e => handleCellChange(idx, "end", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === "Tab") {
                            setEditRow(null);
                            setEditField(null);
                          }
                        }}
                        placeholder="End"
                      />
                    </div>
                  ) : (
                    <span>
                      {entry.start && entry.end
                        ? `${entry.start} - ${entry.end}`
                        : (entry.start || "Start") + " - " + (entry.end || "End")}
                    </span>
                  )}
                </td>
                <td
                  className="mentor-td mentor-td-activity"
                  onClick={() => {
                    setEditRow(idx);
                    setEditField("activity");
                  }}
                >
                  {editRow === idx && editField === "activity" ? (
                    <input
                      className="mentor-activity-input"
                      value={entry.activity}
                      autoFocus
                      onBlur={() => {
                        setEditRow(null);
                        setEditField(null);
                      }}
                      onChange={e => handleCellChange(idx, "activity", e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          setEditRow(null);
                          setEditField(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="mentor-activity-placeholder">
                      {entry.activity || <span>Enter activity</span>}
                    </span>
                  )}
                </td>
                <td className="mentor-td" style={{textAlign: "center"}}>
                  {idx >= initialSlotCount && (
                    <button
                      className="mentor-delete-btn"
                      title="Delete row"
                      onClick={() => handleDeleteRow(idx)}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mentor-add-row">
          <button className="mentor-add-btn" onClick={handleAddRow} type="button">
            <Plus size={18} /> Add Row
          </button>
        </div>
      </div>
      <div className="mentor-save-bar">
        <button className="mentor-save-btn" onClick={handleSave} type="button">
          <Save size={18} /> Save
        </button>
      </div>
    </div>
  );
}

export default MentorWorkflow;