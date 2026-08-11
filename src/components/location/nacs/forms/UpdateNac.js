"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function UpdateNac({ nacId, onSuccess }) {
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

        async function fetchNacData() {
            if (!nacId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await getLocationById("nacs", nacId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    setDistrictId(response.data.districtId?.toString() || "");
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load NAC data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching NAC:", err);
                const errorMsg = "An error occurred while loading NAC data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchNacData();

        return () => {
            isMounted = false;
        };
    }, [nacId, getLocationById]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!nacId) {
            toast.error("NAC ID is missing");
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
            const errorMsg = "NAC name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        try {
            const response = await updateLocation("nacs", nacId, {
                districtId: parseInt(districtId),
                name: trimmedName,
            });

            if (response.success) {
                toast.success(response.message || "NAC updated successfully");
                await fetchLocations("nacs", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update NAC";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating NAC:", err);
            const serverError = "An error occurred while updating the NAC";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [districtId, name, nacId, updateLocation, fetchLocations, onSuccess]);

    const handleRetry = useCallback(async () => {
        if (!nacId) {
            toast.error("No NAC ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("nacs", nacId);
            if (response.success && response.data) {
                setDistrictId(response.data.districtId?.toString() || "");
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load NAC data");
                toast.error(response.message || "Failed to load NAC data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading NAC data");
            toast.error("An error occurred while loading NAC data");
        } finally {
            setIsLoading(false);
        }
    }, [nacId, getLocationById]);

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
                <p className="mt-3 text-secondary-light">Loading NAC data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load NAC</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!nacId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!nacId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No NAC Selected</h6>
                <p className="text-secondary-light mb-4">Please select a NAC to edit</p>
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
                            <span className="fw-semibold">
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
                    <label className="form-label" htmlFor="edit-nac-name">
                        <span className="fw-semibold text-dark">* NAC Name:</span>
                    </label>
                    <input
                        id="edit-nac-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter NAC name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-nac-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-nac-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading || !districtId || !name.trim()}>
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
