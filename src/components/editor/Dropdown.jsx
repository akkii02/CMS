import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ title, value, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center gap-1 p-1.5 hover:bg-surfaceHover rounded text-sm text-textMain min-w-[100px] justify-between"
                onClick={() => setIsOpen(!isOpen)}
                title={title}
            >
                <div className="flex items-center gap-2">
                    {selectedOption.icon && <selectedOption.icon size={16} />}
                    <span className="truncate max-w-[80px] text-left">{selectedOption.label}</span>
                </div>
                <ChevronDown size={14} className="text-textMuted" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl z-50 py-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surfaceHover transition-colors ${value === option.value ? 'bg-primary/10 text-primary' : 'text-textMain'
                                }`}
                            onClick={() => {
                                option.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {option.icon && <option.icon size={16} />}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
