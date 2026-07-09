"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";

export default function CreateState({ onSuccess }) {
  const [name, setName] = useState("");

  const { createLocation, actionLoading } = useLocationStore();

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await createLocation("states", {
      name: name.trim(),
    });

    if (response.success) {
      toast.success(response.message || "State created successfully");

      setName("");
      // await fetchLocations("states", true); // ✅ refresh list
      onSuccess?.();
    } else {
      toast.error(response.message || "Failed to create state");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-12 mb-3">
          <label className="form-label">State Name</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter state name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={actionLoading}
            autoFocus
          />
        </div>
      </div>

      <div className="border-top pt-3 d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-light"
          onClick={onSuccess}
          disabled={actionLoading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={actionLoading}
        >
          {actionLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
