"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import { Icon } from "@iconify/react";

export default function EditState({ stateId, onSuccess }) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        getLocationById,
        updateLocation,
        actionLoading,
        fetchLocations,
        states,
    } = useLocationStore();

    const validateName = useCallback((value) => {
        const trimmed = value.trim();

        if (!trimmed) {
            return "State name is required";
        }

        const exists = states.some((state) => {
            if (state.id === stateId) return false;
            return state.name.toLowerCase() === trimmed.toLowerCase();
        });

        if (exists) {
            return "This state already exists";
        }

        return "";
    }, [stateId, states]);

    // Fetch state data when stateId changes
    useEffect(() => {
        let isMounted = true;

        async function fetchStateData() {
            // If no stateId, show loading but don't show error immediately
            if (!stateId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                const response = await getLocationById("states", stateId);
                
                if (!isMounted) return;

                if (response.success && response.data) {
                    setName(response.data.name || "");
                } else {
                    const errorMsg = response.message || "Failed to load state data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Error fetching state:", error);
                const errorMsg = "An error occurred while loading state data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchStateData();

        return () => {
            isMounted = false;
        };
    }, [stateId, getLocationById]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!stateId) {
            toast.error("State ID is missing");
            return;
        }

        const trimmedName = name.trim();
        const validationError = validateName(trimmedName);

        if (validationError) {
            setFieldError(validationError);
            toast.error(validationError);
            return;
        }

        setFieldError("");

        try {
            const response = await updateLocation("states", stateId, {
                name: trimmedName,
            });

            if (response.success) {
                toast.success(response.message || "State updated successfully");
                await fetchLocations("states", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update state";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (error) {
            console.error("Error updating state:", error);
            const serverError = "An error occurred while updating the state";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [stateId, name, updateLocation, fetchLocations, onSuccess, validateName]);

    // Handle retry
    const handleRetry = useCallback(async () => {
        if (!stateId) {
            toast.error("No state ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("states", stateId);
            
            if (response.success && response.data) {
                setName(response.data.name || "");
            } else {
                setError(response.message || "Failed to load state data");
                toast.error(response.message || "Failed to load state data");
            }
        } catch (error) {
            console.error("Error retrying fetch:", error);
            setError("An error occurred while loading state data");
            toast.error("An error occurred while loading state data");
        } finally {
            setIsLoading(false);
        }
    }, [stateId, getLocationById]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    const handleNameChange = useCallback((e) => {
        setName(e.target.value);
        if (fieldError) {
            setFieldError("");
        }
    }, [fieldError]);

    // Loading state - show this while waiting for stateId or fetching data
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary-light">
                    {!stateId ? "Preparing..." : "Loading state data..."}
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
                <h6 className="text-danger mb-2">Failed to Load State</h6>
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
                        disabled={!stateId}
                    >
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Form state - only show when we have a stateId and data loaded
    if (!stateId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No State Selected</h6>
                <p className="text-secondary-light mb-4">Please select a state to edit</p>
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
                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-state-name">
                         <span className="text-dark fw-semibold">* State Name:</span>
                    </label>
                    <input
                        id="edit-state-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError ? "is-invalid" : ""}`}
                        placeholder="Enter state name"
                        value={name}
                        onChange={handleNameChange}
                        required
                        disabled={actionLoading}
                        autoFocus
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={fieldError ? "edit-state-name-error" : undefined}
                    />
                    {fieldError && (
                        <div id="edit-state-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                    <small className="text-secondary-light mt-1 d-block">
                        ID: {stateId}
                    </small>
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
                    disabled={actionLoading || !name.trim()}
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