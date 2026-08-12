"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import { Icon } from "@iconify/react";

export default function EditDistrict({ districtId, onSuccess }) {
    const [stateId, setStateId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        dropdownCache,
        fetchDropdown,
        getLocationById,
        updateLocation,
        actionLoading,
    } = useLocationStore();

    const states = dropdownCache.states;

    useEffect(() => {
        fetchDropdown("states");
    }, [fetchDropdown]);

    // Fetch district data when districtId changes
    useEffect(() => {
        let isMounted = true;

        async function fetchDistrictData() {
            if (!districtId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await getLocationById("districts", districtId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    setStateId(response.data.stateId?.toString() || "");
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load district data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Error fetching district:", error);
                const errorMsg = "An error occurred while loading district data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchDistrictData();

        return () => {
            isMounted = false;
        };
    }, [districtId, getLocationById]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!districtId) {
            toast.error("District ID is missing");
            return;
        }

        if (!stateId) {
            toast.error("Please select a state");
            return;
        }

        if (!name.trim()) {
            toast.error("District name is required");
            return;
        }

        try {

            const response = await updateLocation(
                "districts",
                districtId,
                {
                    stateId: stateId,
                    name: name.trim(),
                }
            );

            if (response.success) {
                toast.success(response.message || "District updated successfully");
                onSuccess?.();
            } else {
                toast.error(response.message || "Failed to update district");
            }
        } catch (error) {
            console.error("Error updating district:", error);
            toast.error("An error occurred while updating the district");
        }
    }, [districtId, stateId, name, updateLocation, onSuccess]);

    // Handle retry
    const handleRetry = useCallback(async () => {
        if (!districtId) {
            toast.error("No district ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("districts", districtId);

            if (response.success && response.data) {
                setStateId(response.data.stateId?.toString() || "");
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load district data");
                toast.error(response.message || "Failed to load district data");
            }
        } catch (error) {
            console.error("Error retrying fetch:", error);
            setError("An error occurred while loading district data");
            toast.error("An error occurred while loading district data");
        } finally {
            setIsLoading(false);
        }
    }, [districtId, getLocationById]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        onSuccess?.();
    }, [onSuccess]);

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary-light">
                    {!districtId ? "Preparing..." : "Loading district data..."}
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load District</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleRetry}
                        disabled={!districtId}
                    >
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // No district selected
    if (!districtId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No District Selected</h6>
                <p className="text-secondary-light mb-4">Please select a district to edit</p>
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleCancel}
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                {/* State */}
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                        <span className="text-dark fw-semibold">* State:</span>
                    </label>
                    <select
                        className="form-select"
                        value={stateId}
                        onChange={(e) => setStateId(e.target.value)}
                        disabled={actionLoading}
                        required
                    >
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.id}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                    {states.length === 0 && (
                        <small className="text-warning d-block mt-1">
                            No states available. Please add a state first.
                        </small>
                    )}

                </div>

                {/* District Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        <span className="text-dark fw-semibold">* District Name:</span>
                    </label>
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
                    onClick={handleCancel}
                    disabled={actionLoading}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center "
                    disabled={actionLoading || !stateId || !name.trim()}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
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