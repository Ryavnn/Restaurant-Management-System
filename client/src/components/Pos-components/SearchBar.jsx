import React from "react";

function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      name="searchbar"
      id="searchbar"
      placeholder="Search menu..."
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "90%",
        padding: "0.5rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "1rem"
      }}
    />
  );
}

export default SearchBar;