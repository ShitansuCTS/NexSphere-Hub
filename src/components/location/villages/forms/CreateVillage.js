"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateVillage({ onSuccess }) {
    const [gpId, setGpId] = useState("");
    const [name, setName] = useState("");

    const {
        gps,
        fetchLocations,
        createLocation,
        actionLoading,
    } = useLocationStore();

    useEffect(() => {
        fetchLocations("gps");
    }, [fetchLocations]);

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await createLocation("villages", {
            gpId,
            name: name.trim(),
        });

        if (response.success) {
            toast.success(
                response.message || "Village created successfully"
            );

            setStateId("");
            setName("");

            onSuccess?.();
        } else {
            toast.error(
                response.message || "Failed to create village"
            );
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* State */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        GP
                    </label>

                    <SearchSelect
                        options={gps.map((gp) => ({
                            value: gp.id,
                            label: gp.name,
                        }))}
                        value={gpId}
                        onChange={setGpId}
                        placeholder="Search & Select Gp"
                        isDisabled={actionLoading}
                    />
                </div>

                {/* District Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Village Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter village name"
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
                    disabled={actionLoading || !gpId}
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