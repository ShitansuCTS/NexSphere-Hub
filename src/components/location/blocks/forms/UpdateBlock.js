"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function UpdateBlock({ blockId, onSuccess }) {
    const [districtId, setDistrictId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        districts,
        getLocationById,
        updateLocation,
        fetchLocations,
        actionLoading,
        hasFetched,
    } = useLocationStore();

    useEffect(() => {
        if (!hasFetched.districts) {
            fetchLocations("districts", true);
        }
    }, [fetchLocations, hasFetched.districts]);

    useEffect(() => {
        let isMounted = true;

        async function fetchBlockData() {
            if (!blockId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLocationById("blocks", blockId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    setDistrictId(response.data.districtId?.toString() || "");
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load block data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching block:", err);
                const errorMsg = "An error occurred while loading block data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchBlockData();

        return () => {
            isMounted = false;
        };
    }, [blockId, getLocationById]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!blockId) {
            toast.error("Block ID is missing");
            return;
        }

        const trimmedName = name.trim();
        if (!districtId) {
            const errorMsg = "Please select a district";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!trimmedName) {
            const errorMsg = "Block name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        try {
            const response = await updateLocation("blocks", blockId, {
                districtId: parseInt(districtId),
                name: trimmedName,
            });

            if (response.success) {
                toast.success(response.message || "Block updated successfully");
                await fetchLocations("blocks", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update block";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating block:", err);
            const serverError = "An error occurred while updating the block";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [blockId, districtId, name, updateLocation, fetchLocations, onSuccess]);

    const handleRetry = useCallback(async () => {
        if (!blockId) {
            toast.error("No block ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("blocks", blockId);
            if (response.success && response.data) {
                setDistrictId(response.data.districtId?.toString() || "");
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load block data");
                toast.error(response.message || "Failed to load block data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading block data");
            toast.error("An error occurred while loading block data");
        } finally {
            setIsLoading(false);
        }
    }, [blockId, getLocationById]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    const handleDistrictChange = useCallback((value) => {
        setDistrictId(value || "");
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
                <p className="mt-3 text-secondary-light">Loading block data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load Block</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!blockId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!blockId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No Block Selected</h6>
                <p className="text-secondary-light mb-4">Please select a block to edit</p>
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
                            <span className="fw-semibold text-dark">
                                * District:
                            </span>
                        )}
                        options={districts.map((district) => ({
                            value: district.id,
                            label: district.name,
                        }))}
                        value={districtId}
                        onChange={handleDistrictChange}
                        placeholder="Search & Select District"
                        isDisabled={actionLoading}
                        required
                    />
                    {fieldError && !districtId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-block-name">
                        <span className="fw-semibold text-dark">* Block Name:</span>
                    </label>
                    <input
                        id="edit-block-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter block name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-block-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-block-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={actionLoading || !districtId || !name.trim()}>
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
