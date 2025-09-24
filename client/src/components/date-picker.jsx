import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DatePicker({ 
  date, 
  onDateChange, 
  label = "Planting Date", 
  placeholder = "Select planting date",
  className,
  disabled = false,
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDateSelect = (selectedDate) => {
    onDateChange(selectedDate)
    setIsOpen(false)
  }

  // Disable past dates for planting
  const disabledDays = {
    before: new Date(),
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="date-picker" className="text-sm font-medium">
        {label} {required && "*"}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border"
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
      {date && (
        <p className="text-xs text-muted-foreground">
          Selected: {format(date, "EEEE, MMMM do, yyyy")}
        </p>
      )}
    </div>
  )
}

export function PlantingDatePicker({ date, onDateChange, className, disabled = false }) {
  return (
    <DatePicker
      date={date}
      onDateChange={onDateChange}
      label="Planting/Sowing Date"
      placeholder="Select planting date"
      className={className}
      disabled={disabled}
      required={true}
    />
  )
}