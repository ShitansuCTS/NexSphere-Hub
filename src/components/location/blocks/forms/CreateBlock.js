"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateBlock({ onSuccess }) {
    const [districtId, setDistrictId] = useState("");
    const [name, setName] = useState("");

    const {
        districts,
        fetchLocations,
        createLocation,
        actionLoading,
    } = useLocationStore();

    useEffect(() => {
        fetchLocations("districts");
    }, [fetchLocations]);

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await createLocation("blocks", {
            districtId,
            name: name.trim(),
        });

        if (response.success) {
            toast.success(
                response.message || "Block created successfully"
            );

            setDistrictId("");
            setName("");

            onSuccess?.();
        } else {
            toast.error(
                response.message || "Failed to create block"
            );
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* State */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        District
                    </label>

                    <SearchSelect
                        options={districts.map((district) => ({
                            value: district.id,
                            label: district.name,
                        }))}
                        value={districtId}
                        onChange={setDistrictId}
                        placeholder="Search & Select District"
                        isDisabled={actionLoading}
                    />
                </div>

                {/* District Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Block Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter block name"
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
                    disabled={actionLoading || !districtId}
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