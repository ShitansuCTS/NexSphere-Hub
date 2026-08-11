"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function UpdateGp({ gpId, onSuccess }) {
    const [blockId, setBlockId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        blocks,
        getLocationById,
        updateLocation,
        fetchLocations,
        actionLoading,
        hasFetched,
    } = useLocationStore();

    useEffect(() => {
        if (!hasFetched.blocks) {
            fetchLocations("blocks", true);
        }
    }, [fetchLocations, hasFetched.blocks]);

    useEffect(() => {
        let isMounted = true;

        async function fetchGpData() {
            if (!gpId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLocationById("gps", gpId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    setBlockId(response.data.blockId?.toString() || "");
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load GP data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching GP:", err);
                const errorMsg = "An error occurred while loading GP data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchGpData();

        return () => {
            isMounted = false;
        };
    }, [gpId, getLocationById]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!gpId) {
            toast.error("GP ID is missing");
            return;
        }

        const trimmedName = name.trim();
        if (!blockId) {
            const errorMsg = "Please select a block";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!trimmedName) {
            const errorMsg = "GP name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        try {
            const response = await updateLocation("gps", gpId, {
                blockId: parseInt(blockId),
                name: trimmedName,
            });

            if (response.success) {
                toast.success(response.message || "GP updated successfully");
                await fetchLocations("gps", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update GP";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating GP:", err);
            const serverError = "An error occurred while updating the GP";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [blockId, gpId, name, updateLocation, fetchLocations, onSuccess]);

    const handleRetry = useCallback(async () => {
        if (!gpId) {
            toast.error("No GP ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("gps", gpId);
            if (response.success && response.data) {
                setBlockId(response.data.blockId?.toString() || "");
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load GP data");
                toast.error(response.message || "Failed to load GP data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading GP data");
            toast.error("An error occurred while loading GP data");
        } finally {
            setIsLoading(false);
        }
    }, [gpId, getLocationById]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    const handleBlockChange = useCallback((value) => {
        setBlockId(value || "");
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
                <p className="mt-3 text-secondary-light">Loading GP data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load GP</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!gpId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!gpId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No GP Selected</h6>
                <p className="text-secondary-light mb-4">Please select a GP to edit</p>
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
                                * Block:
                            </span>
                        )}
                        options={blocks.map((block) => ({
                            value: block.id,
                            label: block.name,
                        }))}
                        value={blockId}
                        onChange={handleBlockChange}
                        placeholder="Search & Select Block"
                        isDisabled={actionLoading}
                        required
                    />
                    {fieldError && !blockId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-gp-name">
                        <span class="text-dark fw-semibold">* GP Name:</span>
                    </label>
                    <input
                        id="edit-gp-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter GP name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-gp-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-gp-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={actionLoading || !blockId || !name.trim()}>
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
