"use client"

import React, { useId } from "react"

import { cn } from "@/lib/utils"
import { type ColorTheme, COLOR_THEMES } from "@/lib/ascii-data"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Labelled setting controls shared by the studio and the landing page

export function SliderRow({
  label,
  display,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string
  display: React.ReactNode
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}) {
  const id = useId()
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span id={id} className="text-xs text-muted-foreground">
          {label}
        </span>
        <output className="font-mono text-[11px] text-form tabular">{display}</output>
      </div>
      <Slider
        aria-labelledby={id}
        value={[value]}
        onValueChange={(v) => onChange(typeof v === "number" ? v : v[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}

export function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex min-h-6 items-center justify-between gap-3">
      {/* The label targets Base UI's hidden input; aria-labelledby names the visible switch */}
      <Label
        id={`${id}-label`}
        htmlFor={id}
        className="text-xs font-normal text-muted-foreground"
      >
        {label}
      </Label>
      <Switch
        id={id}
        aria-labelledby={`${id}-label`}
        checked={checked}
        onCheckedChange={onChange}
        size="sm"
      />
    </div>
  )
}

export function SelectRow({
  label,
  value,
  options,
  onChange,
  previewFont,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (v: string) => void
  previewFont?: boolean
}) {
  const id = useId()
  return (
    <div className="space-y-2">
      <span id={id} className="block text-xs text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        items={options}
        onValueChange={(v) => v && onChange(v)}
      >
        <SelectTrigger aria-labelledby={id} className="h-8 w-full bg-background text-xs pointer-coarse:h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <span style={previewFont ? { fontFamily: o.value } : undefined}>
                {o.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs text-muted-foreground">{label}</legend>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-8 truncate rounded-sm border px-1 text-xs font-medium transition-colors pointer-coarse:h-10",
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:border-primary hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <label className="relative size-8 shrink-0 cursor-pointer pointer-coarse:size-10 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
          <span className="sr-only">Pick {label.toLowerCase()}</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span className="block size-full" style={{ backgroundColor: value }} />
        </label>
        <input
          id={id}
          type="text"
          // Uncontrolled + keyed so partial hex while typing never reaches the canvas
          key={value}
          defaultValue={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
          }}
          className="h-8 w-[5.5rem] rounded-sm border border-input bg-background px-2 font-mono text-xs uppercase outline-none focus-visible:border-ring pointer-coarse:h-10 pointer-coarse:w-[6.5rem] pointer-coarse:text-base"
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

/** Color preset swatches: paper with ink "#@", plus a stripe for gradient ink. */
export function PresetSwatches({
  isActive,
  onPick,
  className,
}: {
  isActive: (t: ColorTheme) => boolean
  onPick: (t: ColorTheme) => void
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-5 gap-1.5", className)}>
      {COLOR_THEMES.map((t) => (
        <button
          key={t.name}
          type="button"
          title={t.name}
          aria-label={`${t.name} preset`}
          aria-pressed={isActive(t)}
          onClick={() => onPick(t)}
          className="group text-left"
        >
          <span
            className={cn(
              "grid h-9 place-items-center font-mono text-xs font-bold ring-1 ring-border transition-shadow group-hover:ring-2 group-hover:ring-ring",
              isActive(t) && "ring-2 ring-primary"
            )}
            style={{
              backgroundColor: t.background,
              color: t.foreground,
              backgroundImage: t.gradient
                ? `linear-gradient(90deg, transparent 70%, ${t.gradient[1]} 70%)`
                : undefined,
            }}
          >
            #@
          </span>
          <span className="mt-1 block truncate text-[11px] text-muted-foreground group-hover:text-foreground">
            {t.name}
          </span>
        </button>
      ))}
    </div>
  )
}
