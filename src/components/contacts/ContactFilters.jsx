"use client";

import { useState } from "react";

export default function ContactFilters() {

  const [search, setSearch] =
    useState("");

  return (

    <div className="mb-3">

      <input
        className="form-control"
        placeholder="Search..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

    </div>

  );

}