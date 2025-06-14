
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

// import shadcn/ui table components
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// Helper: generate time slots given start/end/interval in minutes
function generateDefaultTimeSlots() {
  const slots: { time: string; activity: string }[] = [];
  const startMinutes = 8 * 60 + 30; // 8:30
  const endMinutes = 16 * 60 + 30; // 16:30
  for (let min = startMinutes; min <= endMinutes; min += 60) {
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
  const [entries, setEntries] = React.useState<{ time: string; activity: string }[]>(generateDefaultTimeSlots);

  // Inline edit state
  const [editRow, setEditRow] = React.useState<number | null>(null);
  const [editField, setEditField] = React.useState<"time" | "activity" | null>(null);

  // Handle cell changes: update entries array by index
  const handleCellChange = (idx: number, field: "time" | "activity", value: string) => {
    setEntries((old) => {
      const updated = old.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry));
      return updated;
    });
  };

  // Save: show toast with result (could be replaced by API call)
  const handleSave = () => {
    toast({
      title: "Workflow Saved",
      description: (
        <pre className="mt-2 bg-muted p-2 rounded text-left whitespace-pre-wrap text-xs">
          {JSON.stringify({ date: format(date, "yyyy-MM-dd"), entries }, null, 2)}
        </pre>
      ),
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-12 px-4 py-6 bg-card rounded-2xl shadow-xl border border-muted animate-fade-in">
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
        <span className="text-sm text-muted-foreground mt-1 md:mt-0">Plan activities by time slot for the day</span>
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
                  idx % 2 === 1 ? "bg-accent/30" : "bg-card", // zebra stripes
                  "hover:bg-primary/10", // subtle hover
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
