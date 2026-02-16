"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState(controlledValue || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onChange]);

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
