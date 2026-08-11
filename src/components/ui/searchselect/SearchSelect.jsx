"use client";

import Select from "react-select";

export default function SearchSelect({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    isDisabled = false,
    required = false,
}) {
    const normalizedValue = value === null || value === undefined ? "" : String(value);
    const selectedOption =
        options.find((option) => String(option.value) === normalizedValue) || null;

    return (
        <div>
            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}

            <Select
                options={options}
                value={selectedOption}
                onChange={(option) =>
                    onChange(option ? option.value : "")
                }
                placeholder={placeholder}
                isSearchable
                isClearable
                isDisabled={isDisabled}
                classNamePrefix="react-select"
                required={required}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
                }}
            />
        </div>
    );
}