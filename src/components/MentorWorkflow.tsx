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

// Helper: format minutes as "H:MM"
function formatTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

// Helper: generate time slots given start/end/interval in minutes as intervals
function generateTimeSlots(type: "standard" | "extended" | "nonInstructional") {
  let slots: { start: string; end: string; activity: string }[] = [];
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
  for (let min = startMinutes; min + interval <= endMinutes; min += interval) {
    const start = formatTime(min);
    const end = formatTime(min + interval);
    slots.push({
      start,
      end,
      activity: "",
    });
  }
  return slots;
}

export default function MentorWorkflow() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [scheduleType, setScheduleType] = React.useState<"standard" | "extended" | "nonInstructional">("standard");
  // ENTRY now: { start, end, activity }
  const [entries, setEntries] = React.useState<{ start: string; end: string; activity: string }[]>(() => generateTimeSlots("standard"));
  const [editRow, setEditRow] = React.useState<number | null>(null);
  const [editField, setEditField] = React.useState<"start" | "end" | "activity" | null>(null);

  // When schedule type changes, reset slots
  React.useEffect(() => {
    setEntries(generateTimeSlots(scheduleType));
    setEditRow(null);
    setEditField(null);
  }, [scheduleType]);

  // Handle cell changes: update entries array by index
  const handleCellChange = (idx: number, field: "start" | "end" | "activity", value: string) => {
    setEntries((old) => old.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
  };

  // Add new row handler
  const handleAddRow = () => {
    setEntries((old) => [...old, { start: "", end: "", activity: "" }]);
    setEditRow(entries.length); // Immediately put focus on new row
    setEditField("start");
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

  // Slight gradient for card wrapper
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-12 px-4 py-6 rounded-2xl shadow-2xl border border-muted animate-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--card)/95%) 80%, hsl(var(--primary)/8%) 100%)",
        boxShadow: "0 8px 32px 0 rgba(60, 96, 160, 0.07)",
      }}
    >
      {/* Schedule Tabs */}
      <Tabs
        value={scheduleType}
        onValueChange={(v) => {
          if (v === "standard" || v === "extended" || v === "nonInstructional") {
            setScheduleType(v);
          }
        }}
        className="mb-8 w-full"
      >
        <TabsList className="w-full max-w-xl flex rounded-lg animate-fade-in">
          <TabsTrigger
            value="standard"
            className="flex-1 flex flex-col items-center relative group"
          >
            <span>Standard</span>
            <span className="font-normal text-xs">8:30 AM - 4:30 PM</span>
          </TabsTrigger>
          <TabsTrigger
            value="extended"
            className="flex-1 flex flex-col items-center relative group"
          >
            <span>Extended</span>
            <span className="font-normal text-xs">10:00 AM - 7:00 PM</span>
          </TabsTrigger>
          <TabsTrigger
            value="nonInstructional"
            className="flex-1 flex flex-col items-center relative group"
          >
            <span>Non-Instructional</span>
            <span className="font-normal text-xs">9:00 AM - 3:00 PM</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <label className="block font-semibold mb-2 text-lg">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "min-w-[220px] justify-start text-left font-normal shadow-sm hover:shadow-md transition",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-40 bg-card shadow-xl border border-primary/10" align="start" alignOffset={-8}>
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
      <div className="overflow-x-auto bg-background rounded-xl border border-muted/70 shadow-lg animate-scale-in"
        style={{ transition: "box-shadow 0.15s" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/60 text-base font-semibold w-48 md:w-56 rounded-tl-xl">
                Time
              </TableHead>
              <TableHead className="bg-muted/60 text-base font-semibold rounded-tr-xl">
                Activity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="animate-fade-in">
            {entries.map((entry, idx) => (
              <TableRow
                key={idx}
                className={cn(
                  "transition-colors text-base group",
                  idx % 2 === 1 ? "bg-accent/30" : "bg-card",
                  "hover:bg-primary/10",
                  editRow === idx && "border-primary border-2 ring-2 ring-primary/40 shadow-lg z-10",
                )}
                style={editRow === idx ? { transition: "box-shadow 0.3s, border 0.2s" } : {}}
              >
                {/* Editable Time (now an interval: start - end) */}
                <TableCell
                  className={cn(
                    "py-3 px-4 align-middle cursor-pointer rounded-l-lg group flex gap-1 items-center",
                    editRow === idx && (editField === "start" || editField === "end") && "bg-secondary/80"
                  )}
                  onClick={() => {
                    setEditRow(idx);
                    setEditField("start");
                  }}
                >
                  {editRow === idx && (editField === "start" || editField === "end") ? (
                    <div className="flex gap-1 items-center w-full">
                      <input
                        className="w-20 px-1 py-1 rounded outline-none border border-muted focus:border-primary bg-background transition-shadow shadow hover:shadow-md"
                        value={entry.start}
                        autoFocus={editField === "start"}
                        onBlur={() => {
                          // If leaving the cell and field was "end", finish editing
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
                        className="w-20 px-1 py-1 rounded outline-none border border-muted focus:border-primary bg-background transition-shadow shadow hover:shadow-md"
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
                </TableCell>
                {/* Editable Activity */}
                <TableCell
                  className={cn(
                    "py-3 px-4 align-middle cursor-pointer rounded-r-lg group hover:bg-secondary/20 transition",
                    editRow === idx && editField === "activity" && "bg-secondary/80"
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
                    <span
                      className={cn(
                        "text-muted-foreground transition-colors",
                        !entry.activity && "opacity-60 italic"
                      )}
                    >
                      {entry.activity || <span>Enter activity</span>}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Add Row Button: below the table as requested */}
        <div className="flex justify-center py-4">
          <Button
            variant="secondary"
            className="flex gap-1 items-center px-4 py-2 rounded-lg text-base font-medium shadow border border-muted transition-transform hover:scale-105 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 animate-fade-in"
            onClick={handleAddRow}
            aria-label="Add row"
            type="button"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSave}
          className="flex gap-1 items-center px-6 py-2 rounded-lg text-base font-semibold shadow transition-transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-primary/80 to-primary/90 text-primary-foreground hover:from-primary hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-fade-in"
        >
          <Save size={18} className="mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}

// This component is now over 350 lines. Please consider asking me to refactor it for easier maintainability.
