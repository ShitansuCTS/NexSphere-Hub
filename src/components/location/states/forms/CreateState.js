"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import { Icon } from "@iconify/react";

export default function CreateState({ onSuccess }) {
    const [name, setName] = useState("");

    const {
        createLocation,
        actionLoading,
    } = useLocationStore();

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("State name is required");
            return;
        }

        const response = await createLocation("states", {
            name: name.trim(),
        });

        if (response.success) {
            toast.success(response.message || "State created successfully");
            setName("");
            onSuccess?.();
        } else {
            toast.error(response.message || "Failed to create state");
        }
    }, [name, createLocation, onSuccess]);

    const handleCancel = useCallback(() => {
        onSuccess?.();
    }, [onSuccess]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                        <span className="text-dark fw-semibold">* State Name:</span>
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
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
                    onClick={handleCancel}
                    disabled={actionLoading}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center"
                    disabled={actionLoading || !name.trim()}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Icon icon="ic:baseline-plus" className="me-1" />
                            Save
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}