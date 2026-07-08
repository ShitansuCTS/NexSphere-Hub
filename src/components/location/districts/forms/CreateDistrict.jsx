"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateDistrict({ onSuccess }) {
  const [stateId, setStateId] = useState("");
  const [name, setName] = useState("");

  const { states, fetchLocations, createLocation, actionLoading } =
    useLocationStore();

  useEffect(() => {
    fetchLocations("states");
  }, [fetchLocations]);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await createLocation("districts", {
      stateId,
      name: name.trim(),
    });

    if (response.success) {
      toast.success(response.message || "District created successfully");

      setStateId("");
      setName("");

      onSuccess?.();
    } else {
      toast.error(response.message || "Failed to create district");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* State */}
        <div className="col-12 mb-3">
          <label className="form-label">State</label>

          <SearchSelect
            options={states.map((state) => ({
              value: state.id,
              label: state.name,
            }))}
            value={stateId}
            onChange={setStateId}
            placeholder="Search & Select State"
            isDisabled={actionLoading}
          />
        </div>

        {/* District Name */}
        <div className="col-12 mb-3">
          <label className="form-label">District Name</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter district name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={actionLoading}
            required
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
          disabled={actionLoading || !stateId}
        >
          {actionLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
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
