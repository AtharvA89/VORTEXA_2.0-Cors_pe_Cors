import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const cropOptions = [
  { value: "wheat", label: "Wheat", icon: "🌾" },
  { value: "maize", label: "Maize (Corn)", icon: "🌽" },
  { value: "rice", label: "Rice", icon: "🌾" },
  { value: "tomato", label: "Tomato", icon: "🍅" },
  { value: "potato", label: "Potato", icon: "🥔" },
  { value: "cotton", label: "Cotton", icon: "🌱" },
  { value: "soybean", label: "Soybean", icon: "🫘" },
  { value: "barley", label: "Barley", icon: "🌾" },
]

export function CropTypeSelect({ value, onValueChange, className, disabled = false }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="crop-type" className="text-sm font-medium">
        Crop Type *
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="crop-type" className="w-full">
          <SelectValue placeholder="Select a crop type" />
        </SelectTrigger>
        <SelectContent>
          {cropOptions.map((crop) => (
            <SelectItem key={crop.value} value={crop.value}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{crop.icon}</span>
                <span>{crop.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { cropOptions }