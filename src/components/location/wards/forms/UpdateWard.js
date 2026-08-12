"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

const normalizeId = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
};

const getWardSelectionState = (wardData) => {
    const village = wardData?.village || null;
    const villageId = normalizeId(village?.id || wardData?.villageId);
    const gpId = normalizeId(village?.gp?.id || village?.gpId);
    const nacId = normalizeId(wardData?.nacId || wardData?.nac?.id);
    const nextAreaType = nacId ? "urban" : "rural";

    return {
        areaType: nextAreaType,
        gpId,
        villageId,
        nacId,
        name: wardData?.name || "",
    };
};

export default function UpdateWard({ wardId, onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [villageId, setVillageId] = useState("");
    const [nacId, setNacId] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        dropdownCache,
        fetchDropdown,
        getLocationById,
        updateLocation,
        actionLoading,
    } = useLocationStore();

    const gps = dropdownCache.gps;
    const nacs = dropdownCache.nacs;
    const villages = dropdownCache.villages;

    useEffect(() => {
        fetchDropdown("gps");
        fetchDropdown("nacs");
    }, [fetchDropdown]);

    useEffect(() => {
        if (areaType === "rural" && gpId) {
            fetchDropdown("villages", { gpId });
        }
    }, [areaType, gpId, fetchDropdown]);

    const filteredVillages = useMemo(() => {
        if (areaType !== "rural" || !gpId) {
            return villages;
        }

        return villages.filter(
            (village) => String(village.gpId) === String(gpId)
        );
    }, [areaType, gpId, villages]);

    useEffect(() => {
        let isMounted = true;

        async function fetchWardData() {
            if (!wardId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLocationById("wards", wardId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    const selectionState = getWardSelectionState(response.data);
                    setAreaType(selectionState.areaType);
                    setGpId(selectionState.gpId);
                    setVillageId(selectionState.villageId);
                    setNacId(selectionState.nacId);
                    setName(selectionState.name);

                    if (selectionState.gpId) {
                        await fetchDropdown("villages", { gpId: selectionState.gpId });
                    }
                } else {
                    const errorMsg = response.message || "Failed to load ward data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching ward:", err);
                const errorMsg = "An error occurred while loading ward data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchWardData();

        return () => {
            isMounted = false;
        };
    }, [wardId, getLocationById, fetchDropdown]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!wardId) {
            toast.error("Ward ID is missing");
            return;
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            const errorMsg = "Ward name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (areaType === "rural") {
            if (!gpId) {
                const errorMsg = "Please select a GP";
                setFieldError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            if (!villageId) {
                const errorMsg = "Please select a village";
                setFieldError(errorMsg);
                toast.error(errorMsg);
                return;
            }
        } else if (!nacId) {
            const errorMsg = "Please select a NAC";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        const payload =
            areaType === "rural"
                ? { name: trimmedName, villageId }
                : { name: trimmedName, nacId };

        try {
            const response = await updateLocation("wards", wardId, payload);
            if (response.success) {
                toast.success(response.message || "Ward updated successfully");
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update ward";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating ward:", err);
            const serverError = "An error occurred while updating the ward";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [areaType, gpId, nacId, name, onSuccess, updateLocation, villageId, wardId]);

    const handleRetry = useCallback(async () => {
        if (!wardId) {
            toast.error("No ward ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getLocationById("wards", wardId);
            if (response.success && response.data) {
                const selectionState = getWardSelectionState(response.data);
                setAreaType(selectionState.areaType);
                setGpId(selectionState.gpId);
                setVillageId(selectionState.villageId);
                setNacId(selectionState.nacId);
                setName(selectionState.name);

                if (selectionState.gpId) {
                    await fetchDropdown("villages", { gpId: selectionState.gpId });
                }
            } else {
                setError(response.message || "Failed to load ward data");
                toast.error(response.message || "Failed to load ward data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading ward data");
            toast.error("An error occurred while loading ward data");
        } finally {
            setIsLoading(false);
        }
    }, [wardId, getLocationById, fetchDropdown]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    const handleAreaTypeChange = useCallback((e) => {
        const nextType = e.target.value;
        setAreaType(nextType);
        setGpId("");
        setVillageId("");
        setNacId("");
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
                <p className="mt-3 text-secondary-light">Loading ward data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load Ward</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!wardId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!wardId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No Ward Selected</h6>
                <p className="text-secondary-light mb-4">Please select a ward to edit</p>
                <button type="button" className="btn btn-light" onClick={handleCancel}>Close</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold" htmlFor="edit-ward-area-type">
                        * Area Type:
                    </label>
                    <select
                        id="edit-ward-area-type"
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
                    <>
                        <div className="col-12 mb-3">
                            <SearchSelect
                                label={(
                                    <span className="fw-semibold">
                                        * Gram Panchayat:
                                    </span>
                                )}
                                options={gps.map((gp) => ({
                                    value: normalizeId(gp.id),
                                    label: gp.name,
                                }))}
                                value={gpId}
                                onChange={(value) => {
                                    setGpId(normalizeId(value));
                                    setVillageId("");
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

                        <div className="col-12 mb-3">
                            <SearchSelect
                                label={(
                                    <span className="fw-semibold">
                                        * Village:
                                    </span>
                                )}
                                options={filteredVillages.map((village) => ({
                                    value: normalizeId(village.id),
                                    label: village.name,
                                }))}
                                value={villageId}
                                onChange={(value) => {
                                    setVillageId(normalizeId(value));
                                    if (fieldError) {
                                        setFieldError("");
                                    }
                                }}
                                placeholder="Search & Select Village"
                                isDisabled={actionLoading || !gpId}
                                required
                            />
                            {fieldError && gpId && !villageId && (
                                <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                            )}
                        </div>
                    </>
                )}

                {areaType === "urban" && (
                    <div className="col-12 mb-3">
                        <SearchSelect
                            label={(
                                <span className="text-dark fw-semibold">
                                    * NAC:
                                </span>
                            )}
                            options={nacs.map((nac) => ({
                                value: normalizeId(nac.id),
                                label: nac.name,
                            }))}
                            value={nacId}
                            onChange={(value) => {
                                setNacId(normalizeId(value));
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
                    <label className="form-label" htmlFor="edit-ward-name">
                        <span className="text-dark fw-semibold">* Ward Name:</span>
                    </label>
                    <input
                        id="edit-ward-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter ward name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "edit-ward-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="edit-ward-name-error" className="invalid-feedback d-block mt-2">
                            {fieldError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center"
                    disabled={
                        actionLoading ||
                        !name.trim() ||
                        (areaType === "rural" ? !gpId || !villageId : !nacId)
                    }
                >
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
