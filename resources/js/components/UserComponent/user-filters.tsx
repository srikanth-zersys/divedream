import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, X } from "lucide-react";
import Select from "react-select";
import { useSelector } from 'react-redux';
import { RootState } from '../../slices/reducer'; 
import { LAYOUT_MODE_TYPES } from '../Constants/layout'; 

interface FilterProps {
    onFilterChange: (filters: FilterValues) => void;
    onReset: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export interface FilterValues {
    name: string;
    role: string;
    status: string;
}

interface SelectOption {
    value: string;
    label: string;
}

const UsersFilter: React.FC<FilterProps> = ({
    onFilterChange,
    onReset,
    isOpen,
    onClose,
}) => {
    // Get theme from Redux store instead of DOM manipulation
    const { layoutMode } = useSelector((state: RootState) => state.Layout);
    const isDarkMode = layoutMode === LAYOUT_MODE_TYPES.DARK;
    
    // State to manage filter values
    const [filters, setFilters] = useState<FilterValues>({
        name: "",
        role: "",
        status: "",
    });

    // Memoized select options
    const roleOptions = useMemo<SelectOption[]>(() => [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
    ], []);

    const statusOptions = useMemo<SelectOption[]>(() => [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ], []);

    // Enhanced custom styles based on Redux theme state
    const customStyles = useMemo(() => ({
        control: (base: any, state: any) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused 
                ? (isDarkMode ? "#3b82f6" : "#3b82f6")
                : (isDarkMode ? "#475569" : "#d1d5db"),
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            boxShadow: state.isFocused 
                ? (isDarkMode ? "0 0 0 1px #3b82f6" : "0 0 0 1px #3b82f6")
                : "none",
            "&:hover": {
                borderColor: isDarkMode ? "#64748b" : "#9ca3af",
            },
            transition: "all 0.2s ease",
        }),
        
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                    ? (isDarkMode ? "#374151" : "#f3f4f6")
                    : (isDarkMode ? "#1f2937" : "#ffffff"),
            color: state.isSelected 
                ? "#ffffff" 
                : (isDarkMode ? "#f9fafb" : "#111827"),
            cursor: "pointer",
            "&:active": {
                backgroundColor: state.isSelected 
                    ? "#3b82f6" 
                    : (isDarkMode ? "#4b5563" : "#e5e7eb"),
            },
        }),
        
        menu: (base: any) => ({
            ...base,
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
            boxShadow: isDarkMode 
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }),
        
        menuList: (base: any) => ({
            ...base,
            padding: "4px",
        }),
        
        placeholder: (base: any) => ({
            ...base,
            color: isDarkMode ? "#9ca3af" : "#6b7280",
        }),
        
        singleValue: (base: any) => ({
            ...base,
            color: isDarkMode ? "#f9fafb" : "#111827",
        }),
        
        indicatorSeparator: (base: any) => ({
            ...base,
            backgroundColor: isDarkMode ? "#4b5563" : "#d1d5db",
        }),
        
        dropdownIndicator: (base: any, state: any) => ({
            ...base,
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            "&:hover": {
                color: isDarkMode ? "#f3f4f6" : "#374151",
            },
            transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
        }),
        
        clearIndicator: (base: any) => ({
            ...base,
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            "&:hover": {
                color: isDarkMode ? "#f87171" : "#ef4444",
            },
        }),
        
        input: (base: any) => ({
            ...base,
            color: isDarkMode ? "#f9fafb" : "#111827",
        }),
    }), [isDarkMode]);

    // Optimized event handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSelectChange = useCallback((name: string) => 
        (option: SelectOption | null) => {
            setFilters((prev) => ({
                ...prev,
                [name]: option ? option.value : "",
            }));
        }, 
    []);

    const getCurrentOption = useCallback((options: SelectOption[], value: string) => {
        return options.find((option) => option.value === value) || null;
    }, []);

    const applyFilters = useCallback(() => {
        onFilterChange(filters);
        onClose();
    }, [filters, onFilterChange, onClose]);

    const resetFilters = useCallback(() => {
        const emptyFilters = {
            name: "",
            role: "",
            status: "",
        };
        setFilters(emptyFilters);
        onReset();
    }, [onReset]);

  

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            ></div>

            {/* Offcanvas */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } overflow-y-auto`}
                style={{ zIndex: 5000 }}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Filter Users
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4">
                    {/* Filter Form */}
                    <div className="space-y-4">
                        {/* Search by Name/Email */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                            >
                                Search by Name/Email
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={filters.name}
                                onChange={handleInputChange}
                                placeholder="Enter name or email"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                            >
                                Role
                            </label>
                            <Select
                                id="role"
                                instanceId="role-select"
                                options={roleOptions}
                                value={getCurrentOption(roleOptions, filters.role)}
                                onChange={handleSelectChange("role")}
                                placeholder="Select role"
                                isClearable
                                isSearchable={false}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customStyles}
                                aria-label="Select role"
                                theme={(selectTheme) => ({
                                    ...selectTheme,
                                    colors: {
                                        ...selectTheme.colors,
                                        primary: '#3b82f6',
                                        primary75: '#60a5fa',
                                        primary50: '#93c5fd',
                                        primary25: '#dbeafe',
                                    },
                                })}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                            >
                                Status
                            </label>
                            <Select
                                id="status"
                                instanceId="status-select"
                                options={statusOptions}
                                value={getCurrentOption(statusOptions, filters.status)}
                                onChange={handleSelectChange("status")}
                                placeholder="Select status"
                                isClearable
                                isSearchable={false}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customStyles}
                                aria-label="Select status"
                                theme={(selectTheme) => ({
                                    ...selectTheme,
                                    colors: {
                                        ...selectTheme.colors,
                                        primary: '#3b82f6',
                                        primary75: '#60a5fa',
                                        primary50: '#93c5fd',
                                        primary25: '#dbeafe',
                                    },
                                })}
                            />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="flex-1 bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsersFilter;