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
  const selectedOption =
    options.find((option) => option.value === value) || null;

  return (
    <div>
      {label && <label className="form-label">{label}</label>}

      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option ? option.value : "")}
        placeholder={placeholder}
        isSearchable
        isClearable
        isDisabled={isDisabled}
        classNamePrefix="react-select"
        required={required}
      />
    </div>
  );
}
