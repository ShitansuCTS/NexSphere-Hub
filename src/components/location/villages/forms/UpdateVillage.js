"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function UpdateVillage({ villageId, onSuccess }) {
    const [gpId, setGpId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        gps,
        getLocationById,
        updateLocation,
        fetchLocations,
        actionLoading,
        hasFetched,
    } = useLocationStore();

    useEffect(() => {
        if (!hasFetched.gps) {
            fetchLocations("gps", true);
        }
    }, [fetchLocations, hasFetched.gps]);

    useEffect(() => {
        let isMounted = true;

        async function fetchVillageData() {
            if (!villageId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLocationById("villages", villageId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    setGpId(response.data.gpId?.toString() || "");
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load village data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching village:", err);
                const errorMsg = "An error occurred while loading village data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchVillageData();

        return () => {
            isMounted = false;
        };
    }, [villageId, getLocationById]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!villageId) {
            toast.error("Village ID is missing");
            return;
        }

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

        try {
            const response = await updateLocation("villages", villageId, {
                gpId: parseInt(gpId),
                name: trimmedName,
            });

            if (response.success) {
                toast.success(response.message || "Village updated successfully");
                await fetchLocations("villages", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update village";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating village:", err);
            const serverError = "An error occurred while updating the village";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [gpId, villageId, name, updateLocation, fetchLocations, onSuccess]);

    const handleRetry = useCallback(async () => {
        if (!villageId) {
            toast.error("No village ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("villages", villageId);
            if (response.success && response.data) {
                setGpId(response.data.gpId?.toString() || "");
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load village data");
                toast.error(response.message || "Failed to load village data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading village data");
            toast.error("An error occurred while loading village data");
        } finally {
            setIsLoading(false);
        }
    }, [villageId, getLocationById]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

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

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary-light">Loading village data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load Village</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!villageId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!villageId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No Village Selected</h6>
                <p className="text-secondary-light mb-4">Please select a village to edit</p>
                <button type="button" className="btn btn-light" onClick={handleCancel}>Close</button>
            </div>
        );
    }

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
                    <label className="form-label" htmlFor="edit-village-name">
                        <span className="text-dark fw-semibold">* Village Name:</span>
                    </label>
                    <input
                        id="edit-village-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter village name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-village-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-village-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={actionLoading || !gpId || !name.trim()}>
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:content-save" className="me-1" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
