"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateGp({ onSuccess }) {
    const [blockId, setBlockId] = useState("");
    const [name, setName] = useState("");

    const {
        blocks,
        fetchLocations,
        createLocation,
        actionLoading,
    } = useLocationStore();

    useEffect(() => {
        fetchLocations("blocks");
    }, [fetchLocations]);

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await createLocation("gps", {
            blockId,
            name: name.trim(),
        });

        if (response.success) {
            toast.success(
                response.message || "GP created successfully"
            );

            setBlockId("");
            setName("");

            onSuccess?.();
        } else {
            toast.error(
                response.message || "Failed to create district"
            );
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* State */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Block
                    </label>

                    <SearchSelect
                        options={blocks.map((block) => ({
                            value: block.id,
                            label: block.name,
                        }))}
                        value={blockId}
                        onChange={setBlockId}
                        placeholder="Search & Select Block"
                        isDisabled={actionLoading}
                    />
                </div>

                {/* District Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        GP Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Gram Panchayat name"
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
                    disabled={actionLoading || !blockId}
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