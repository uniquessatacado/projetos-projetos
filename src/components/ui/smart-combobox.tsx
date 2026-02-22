"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SmartComboboxProps {
  options: { value: string; label: string; whatsapp?: string }[];
  value: string;
  onSelect: (value: string, whatsapp?: string) => void;
  placeholder: string;
  emptyText: string;
}

export function SmartCombobox({
  options,
  value,
  onSelect,
  placeholder,
  emptyText,
}: SmartComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value
            ? options.find((opt) => opt.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Buscar ${placeholder.toLowerCase()}...`} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty className="p-2">
              <p className="text-xs text-muted-foreground mb-2">{emptyText}</p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full h-8 text-xs"
                onClick={() => {
                    onSelect(searchValue);
                    setOpen(false);
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> Usar "{searchValue}"
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value, option.whatsapp);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.whatsapp && <span className="text-[10px] text-slate-400">{option.whatsapp}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}