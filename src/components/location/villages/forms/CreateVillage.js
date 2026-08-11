"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateVillage({ onSuccess }) {
    const [gpId, setGpId] = useState("");
    const [name, setName] = useState("");
    const [fieldError, setFieldError] = useState("");

    const {
        gps,
        fetchLocations,
        createLocation,
        actionLoading,
        hasFetched,
    } = useLocationStore();

    useEffect(() => {
        if (!hasFetched.gps) {
            fetchLocations("gps", true);
        }
    }, [fetchLocations, hasFetched.gps]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!gpId) {
            const errorMsg = "Please select a GP";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!trimmedName) {
            const errorMsg = "Village name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        const response = await createLocation("villages", {
            gpId: parseInt(gpId),
            name: trimmedName,
        });

        if (response.success) {
            toast.success(response.message || "Village created successfully");
            setGpId("");
            setName("");
            onSuccess?.();
        } else {
            const errorMsg = response.message || "Failed to create village";
            setFieldError(errorMsg);
            toast.error(errorMsg);
        }
    }, [gpId, createLocation, name, onSuccess]);

    const handleGpChange = useCallback((value) => {
        setGpId(value || "");
        if (fieldError) {
            setFieldError("");
        }
    }, [fieldError]);

    const handleNameChange = useCallback((e) => {
        setName(e.target.value);
        if (fieldError) {
            setFieldError("");
        }
    }, [fieldError]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <SearchSelect
                        label={(
                            <span className="text-dark fw-semibold">
                                * GP:
                            </span>
                        )}
                        options={gps.map((gp) => ({
                            value: gp.id,
                            label: gp.name,
                        }))}
                        value={gpId}
                        onChange={handleGpChange}
                        placeholder="Search & Select GP"
                        isDisabled={actionLoading}
                        required
                    />
                    {fieldError && !gpId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="create-village-name">
                        <span className="text-dark fw-semibold">* Village Name:</span>
                    </label>
                    <input
                        id="create-village-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter village name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "create-village-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="create-village-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onSuccess}
                    disabled={actionLoading}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center"
                    disabled={actionLoading || !gpId || !name.trim()}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:content-save" className="me-1" />
                            Save
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}