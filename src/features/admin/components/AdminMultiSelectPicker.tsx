"use client";

import { useEffect, useState, useRef } from "react";
import { X, Check, ChevronDown } from "lucide-react";

interface Option {
    label: string;
    value: string | number;
}

interface MultiSelectPickerProps {
    options: Option[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    error?: boolean;
}

export default function AdminMultiSelectPicker({
    options,
    value,
    onChange,
    placeholder = "Select...",
    error
}: MultiSelectPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial load: Handle clicks outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string | number) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const removeValue = (targetValue: string | number) => {
        onChange(value.filter(v => v !== targetValue));
    };

    const getLabel = (val: string | number) => {
        return options.find(o => o.value === val)?.label || String(val);
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Trigger Box */}
            <div
                className={`relative min-h-[40px] w-full rounded-md border bg-white px-3 py-2 text-sm cursor-pointer
                ${error ? "border-red-500" : "border-stone-200"}
                focus-within:ring-2 focus-within:ring-stone-900 focus-within:ring-offset-2
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-2 pr-6">
                    {value.length === 0 && (
                        <span className="text-stone-400">{placeholder}</span>
                    )}
                    {value.map((val) => (
                        <div
                            key={val}
                            onClick={(e) => { e.stopPropagation(); removeValue(val); }}
                            className="flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-xs font-medium border border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            {getLabel(val)}
                            <X className="h-3 w-3" />
                        </div>
                    ))}
                </div>
                <ChevronDown className={`absolute right-3 top-3 h-4 w-4 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-stone-400 text-center">No options available</div>
                    ) : (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-stone-50 transition-colors
                                ${value.includes(option.value) ? 'bg-stone-50 text-stone-900 font-medium' : 'text-stone-600'}`}
                                onClick={() => toggleOption(option.value)}
                            >
                                <span>{option.label}</span>
                                {value.includes(option.value) && (
                                    <Check className="h-4 w-4 text-stone-900" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
