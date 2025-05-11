// components/google-font-selector.tsx
'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const googleFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Poppins',
  'Nunito',
  'Raleway',
  'Ubuntu',
  'Playfair Display'
];

interface GoogleFontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function GoogleFontSelector({ value, onChange }: GoogleFontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredFonts = googleFonts.filter(font =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span style={{ fontFamily: value }}>{value}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search fonts..." 
            onValueChange={setSearch}
          />
          <CommandEmpty>No font found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {filteredFonts.map((font) => (
              <CommandItem
                key={font}
                value={font}
                onSelect={() => {
                  onChange(font);
                  setOpen(false);
                }}
                style={{ fontFamily: font }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === font ? "opacity-100" : "opacity-0"
                  )}
                />
                {font}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}