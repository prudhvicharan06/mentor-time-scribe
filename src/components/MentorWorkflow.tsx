import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Helper: generate time slots given start/end/interval in minutes
function generateTimeSlots(type: "standard" | "extended" | "nonInstructional") {
  let slots: { time: string; activity: string }[] = [];
  let startMinutes: number, endMinutes: number, interval: number;
  switch (type) {
    case "standard":
      startMinutes = 8 * 60 + 30; // 8:30
      endMinutes = 16 * 60 + 30;  // 16:30
      interval = 60;
      break;
    case "extended":
      startMinutes = 10 * 60;     // 10:00
      endMinutes = 19 * 60;       // 19:00
      interval = 60;
      break;
    case "nonInstructional":
      startMinutes = 9 * 60;      // 9:00
      endMinutes = 15 * 60;       // 15:00
      interval = 90;
      break;
    default:
      startMinutes = 8 * 60 + 30;
      endMinutes = 16 * 60 + 30;
      interval = 60;
  }
  for (let min = startMinutes; min <= endMinutes; min += interval) {
    const hour = Math.floor(min / 60);
    const minute = min % 60;
    const ampm = hour < 12 ? "AM" : "PM";
    const displayHour = ((hour + 11) % 12) + 1;
    slots.push({
      time: `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`,
      activity: "",
    });
  }
  return slots;
}

export default function MentorWorkflow() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [scheduleType, setScheduleType] = React.useState<"standard" | "extended" | "nonInstructional">("standard");
  const [entries, setEntries] = React.useState<{ time: string; activity: string }[]>(() => generateTimeSlots("standard"));
  const [editRow, setEditRow] = React.useState<number | null>(null);
  const [editField, setEditField] = React.useState<"time" | "activity" | null>(null);

  // When schedule type changes, reset slots
  React.useEffect(() => {
    setEntries(generateTimeSlots(scheduleType));
    setEditRow(null);
    setEditField(null);
  }, [scheduleType]);

  // Handle cell changes: update entries array by index
  const handleCellChange = (idx: number, field: "time" | "activity", value: string) => {
    setEntries((old) => old.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
  };

  // Add new row handler
  const handleAddRow = () => {
    setEntries((old) => [...old, { time: "", activity: "" }]);
    setEditRow(entries.length); // Immediately put focus on new row
    setEditField("time");
  };

  // Save: show toast with result (could be replaced by API call)
  const handleSave = () => {
    toast({
      title: "Workflow Saved",
      description: (
        <pre className="mt-2 bg-muted p-2 rounded text-left whitespace-pre-wrap text-xs">
          {JSON.stringify({ date: format(date, "yyyy-MM-dd"), scheduleType, entries }, null, 2)}
        </pre>
      ),
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-12 px-4 py-6 bg-card rounded-2xl shadow-xl border border-muted animate-fade-in">
      {/* Schedule Tabs with Add (plus) button inside each tab trigger */}
      <Tabs value={scheduleType} onValueChange={(v) => {
        if (v === "standard" || v === "extended" || v === "nonInstructional") {
          setScheduleType(v);
        }
      }} className="mb-8 w-full">
        <TabsList className="w-full max-w-xl flex rounded-lg">
          <TabsTrigger value="standard" className="flex-1 flex flex-col items-center relative group">
            <span>Standard</span>
            <span className="font-normal text-xs">
              8:30 AM - 4:30 PM
            </span>
            <button
              type="button"
              aria-label="Add row for Standard schedule"
              className="absolute top-1 right-2 md:right-4 p-1.5 rounded-full bg-background hover:bg-accent transition-colors border border-muted/60 shadow-sm group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                handleAddRow();
              }}
              onMouseDown={e => e.preventDefault()} // Prevent tab switch on click
            >
              <Plus size={16} />
            </button>
          </TabsTrigger>
          <TabsTrigger value="extended" className="flex-1 flex flex-col items-center relative group">
            <span>Extended</span>
            <span className="font-normal text-xs">
              10:00 AM - 7:00 PM
            </span>
            <button
              type="button"
              aria-label="Add row for Extended schedule"
              className="absolute top-1 right-2 md:right-4 p-1.5 rounded-full bg-background hover:bg-accent transition-colors border border-muted/60 shadow-sm group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                handleAddRow();
              }}
              onMouseDown={e => e.preventDefault()}
            >
              <Plus size={16} />
            </button>
          </TabsTrigger>
          <TabsTrigger value="nonInstructional" className="flex-1 flex flex-col items-center relative group">
            <span>Non-Instructional</span>
            <span className="font-normal text-xs">
              9:00 AM - 3:00 PM
            </span>
            <button
              type="button"
              aria-label="Add row for Non-Instructional schedule"
              className="absolute top-1 right-2 md:right-4 p-1.5 rounded-full bg-background hover:bg-accent transition-colors border border-muted/60 shadow-sm group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                handleAddRow();
              }}
              onMouseDown={e => e.preventDefault()}
            >
              <Plus size={16} />
            </button>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <label className="block font-semibold mb-2 text-lg">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "min-w-[220px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" alignOffset={-8}>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) setDate(newDate);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <span className="text-sm text-muted-foreground mt-1 md:mt-0">
          {scheduleType === "standard"
            ? "Standard mentor hours"
            : scheduleType === "extended"
            ? "Extended mentor hours"
            : "Non-Instructional day schedule"}
        </span>
      </div>

      {/* Appealing Table */}
      <div className="overflow-x-auto bg-background rounded-xl border border-muted/70 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/60 text-base font-semibold w-32 md:w-48 rounded-tl-xl">
                Time
              </TableHead>
              <TableHead className="bg-muted/60 text-base font-semibold rounded-tr-xl">
                Activity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, idx) => (
              <TableRow
                key={idx}
                className={cn(
                  "transition-colors text-base",
                  idx % 2 === 1 ? "bg-accent/30" : "bg-card",
                  "hover:bg-primary/10",
                  editRow === idx && "ring-2 ring-primary/40"
                )}
              >
                {/* Editable Time */}
                <TableCell
                  className={cn(
                    "py-3 px-4 align-middle cursor-pointer rounded-l-lg group",
                    editRow === idx && editField === "time" && "bg-secondary"
                  )}
                  onClick={() => {
                    setEditRow(idx);
                    setEditField("time");
                  }}
                >
                  {editRow === idx && editField === "time" ? (
                    <input
                      className="w-28 md:w-36 px-2 py-1 rounded outline-none border border-muted focus:border-primary bg-background transition-shadow shadow hover:shadow-md"
                      value={entry.time}
                      autoFocus
                      onBlur={() => { setEditRow(null); setEditField(null); }}
                      onChange={e => handleCellChange(idx, "time", e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          setEditRow(null); setEditField(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="">{entry.time}</span>
                  )}
                </TableCell>
                {/* Editable Activity */}
                <TableCell
                  className={cn(
                    "py-3 px-4 align-middle cursor-pointer rounded-r-lg group",
                    editRow === idx && editField === "activity" && "bg-secondary"
                  )}
                  onClick={() => {
                    setEditRow(idx);
                    setEditField("activity");
                  }}
                >
                  {editRow === idx && editField === "activity" ? (
                    <input
                      className="w-full max-w-xs px-2 py-1 rounded outline-none border border-muted focus:border-primary bg-background transition-shadow shadow hover:shadow-md"
                      value={entry.activity}
                      autoFocus
                      onBlur={() => { setEditRow(null); setEditField(null); }}
                      onChange={e => handleCellChange(idx, "activity", e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          setEditRow(null); setEditField(null);
                        }
                      }}
                    />
                  ) : (
                    <span className={cn(
                      "text-muted-foreground",
                      !entry.activity && "opacity-60 italic"
                    )}>
                      {entry.activity || <span>Enter activity</span>}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Save Action Bar */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSave}
          className="flex gap-1 items-center px-6 py-2 rounded-lg text-base font-semibold"
        >
          <Save size={18} className="mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
