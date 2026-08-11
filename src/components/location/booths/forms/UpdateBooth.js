"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

const normalizeId = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
};

const getBoothSelectionState = (boothData) => {
    const ward = boothData?.ward || null;
    const wardId = normalizeId(boothData?.wardId || ward?.id);
    const gpId = normalizeId(ward?.village?.gp?.id || boothData?.gpId);
    const nacId = normalizeId(ward?.nac?.id || boothData?.nacId);
    const nextAreaType = nacId ? "urban" : "rural";

    return {
        areaType: nextAreaType,
        gpId,
        nacId,
        wardId,
        name: boothData?.name || "",
    };
};

export default function UpdateBooth({ boothId, onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [nacId, setNacId] = useState("");
    const [wardId, setWardId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        gps,
        nacs,
        wards,
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
        if (!hasFetched.nacs) {
            fetchLocations("nacs", true);
        }
        if (!hasFetched.wards) {
            fetchLocations("wards", true);
        }
    }, [fetchLocations, hasFetched.gps, hasFetched.nacs, hasFetched.wards]);

    useEffect(() => {
        let isMounted = true;

        async function fetchBoothData() {
            if (!boothId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLocationById("booths", boothId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    const selectionState = getBoothSelectionState(response.data);
                    setAreaType(selectionState.areaType);
                    setGpId(selectionState.gpId);
                    setNacId(selectionState.nacId);
                    setWardId(selectionState.wardId);
                    setName(selectionState.name);
                } else {
                    const errorMsg = response.message || "Failed to load booth data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching booth:", err);
                const errorMsg = "An error occurred while loading booth data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchBoothData();

        return () => {
            isMounted = false;
        };
    }, [boothId, getLocationById]);

    const filteredWards = (wards ?? []).filter((ward) => {
        if (areaType === "rural") {
            return String(ward.gpId) === String(gpId);
        }
        return String(ward.nacId) === String(nacId);
    });

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!boothId) {
            toast.error("Booth ID is missing");
            return;
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            const errorMsg = "Booth name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        const payload = {
            areaType,
            wardId,
            name: trimmedName,
        };

        if ((areaType === "rural" && !gpId) || (areaType === "urban" && !nacId)) {
            const errorMsg = areaType === "rural" ? "Please select a GP" : "Please select a NAC";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!wardId) {
            const errorMsg = "Please select a ward";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        try {
            const response = await updateLocation("booths", boothId, payload);
            if (response.success) {
                toast.success(response.message || "Booth updated successfully");
                await fetchLocations("booths", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update booth";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating booth:", err);
            const serverError = "An error occurred while updating the booth";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [areaType, boothId, fetchLocations, gpId, nacId, name, onSuccess, updateLocation, wardId]);

    const handleRetry = useCallback(async () => {
        if (!boothId) {
            toast.error("No booth ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("booths", boothId);
            if (response.success && response.data) {
                const selectionState = getBoothSelectionState(response.data);
                setAreaType(selectionState.areaType);
                setGpId(selectionState.gpId);
                setNacId(selectionState.nacId);
                setWardId(selectionState.wardId);
                setName(selectionState.name);
            } else {
                setError(response.message || "Failed to load booth data");
                toast.error(response.message || "Failed to load booth data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading booth data");
            toast.error("An error occurred while loading booth data");
        } finally {
            setIsLoading(false);
        }
    }, [boothId, getLocationById]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    const handleAreaTypeChange = useCallback((e) => {
        const nextType = e.target.value;
        setAreaType(nextType);
        setGpId("");
        setNacId("");
        setWardId("");
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
                <p className="mt-3 text-secondary-light">Loading booth data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load Booth</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!boothId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!boothId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No Booth Selected</h6>
                <p className="text-secondary-light mb-4">Please select a booth to edit</p>
                <button type="button" className="btn btn-light" onClick={handleCancel}>Close</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold" htmlFor="edit-booth-area-type">
                        * Area Type:
                    </label>
                    <select
                        id="edit-booth-area-type"
                        className="form-select form-select-sm"
                        value={areaType}
                        onChange={handleAreaTypeChange}
                        disabled={actionLoading}
                    >
                        <option value="rural">Rural</option>
                        <option value="urban">Urban</option>
                    </select>
                </div>

                {areaType === "rural" && (
                    <div className="col-12 mb-3">
                        <SearchSelect
                            label={(
                                <span className="text-dark fw-semibold">
                                    * Gram Panchayat:
                                </span>
                            )}
                            options={(gps ?? []).map((gp) => ({
                                value: normalizeId(gp.id),
                                label: gp.name,
                            }))}
                            value={gpId}
                            onChange={(value) => {
                                setGpId(normalizeId(value));
                                setWardId("");
                                if (fieldError) {
                                    setFieldError("");
                                }
                            }}
                            placeholder="Search & Select GP"
                            isDisabled={actionLoading}
                            required
                        />
                        {fieldError && !gpId && (
                            <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                        )}
                    </div>
                )}

                {areaType === "urban" && (
                    <div className="col-12 mb-3">
                        <SearchSelect
                            label={(
                                <span className="text-dark fw-semibold">
                                    * NAC:
                                </span>
                            )}
                            options={(nacs ?? []).map((nac) => ({
                                value: normalizeId(nac.id),
                                label: nac.name,
                            }))}
                            value={nacId}
                            onChange={(value) => {
                                setNacId(normalizeId(value));
                                setWardId("");
                                if (fieldError) {
                                    setFieldError("");
                                }
                            }}
                            placeholder="Search & Select NAC"
                            isDisabled={actionLoading}
                            required
                        />
                        {fieldError && !nacId && (
                            <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                        )}
                    </div>
                )}

                <div className="col-12 mb-3">
                    <SearchSelect
                        label={(
                            <span className="text-dark fw-semibold">
                                * Ward:
                            </span>
                        )}
                        options={filteredWards.map((ward) => ({
                            value: normalizeId(ward.id),
                            label: ward.name,
                        }))}
                        value={wardId}
                        onChange={(value) => {
                            setWardId(normalizeId(value));
                            if (fieldError) {
                                setFieldError("");
                            }
                        }}
                        placeholder="Search & Select Ward"
                        isDisabled={actionLoading || (areaType === "rural" ? !gpId : !nacId)}
                        required
                    />
                    {fieldError && !wardId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-booth-name">
                        <span className="text-dark fw-semibold">* Booth Name:</span>
                    </label>
                    <input
                        id="edit-booth-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter booth name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-booth-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-booth-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading || !wardId || !name.trim()}>
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
