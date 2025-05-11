// components/color-picker.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Palette } from 'lucide-react';
import { useState } from 'react';
import { ColorPicker, useColor, type IColor } from 'react-color-palette';
import 'react-color-palette/css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export default function ColorPickerComponent({
  color,
  onChange,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [colorState, setColorState] = useColor(color);

  const handleChange = (color: IColor) => {
    setColorState(color);
    onChange(color.hex);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between px-3',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs">{color.toUpperCase()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3" style={{ width: 250 }}>
          <ColorPicker
            color={colorState}
            onChange={handleChange}
            hideInput={['rgb', 'hsv']}
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Palette className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}