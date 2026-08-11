"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateWard({ onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [nacId, setNacId] = useState("");
    const [name, setName] = useState("");
    const [fieldError, setFieldError] = useState("");

    const {
        gps,
        nacs,
        fetchLocations,
        createLocation,
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
    }, [fetchLocations, hasFetched.gps, hasFetched.nacs]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            const errorMsg = "Ward name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        const payload = {
            areaType,
            name: trimmedName,
        };

        if (areaType === "rural") {
            payload.gpId = gpId;
        } else {
            payload.nacId = nacId;
        }

        if ((areaType === "rural" && !gpId) || (areaType === "urban" && !nacId)) {
            const errorMsg = areaType === "rural" ? "Please select a GP" : "Please select a NAC";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        const response = await createLocation("wards", payload);

        if (response.success) {
            toast.success(response.message || "Ward created successfully");
            setAreaType("rural");
            setGpId("");
            setNacId("");
            setName("");
            onSuccess?.();
        } else {
            const errorMsg = response.message || "Failed to create ward";
            setFieldError(errorMsg);
            toast.error(errorMsg);
        }
    }, [areaType, createLocation, gpId, nacId, name, onSuccess]);

    const handleAreaTypeChange = useCallback((e) => {
        const nextType = e.target.value;
        setAreaType(nextType);
        setGpId("");
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold" htmlFor="ward-area-type">
                        * Area Type:
                    </label>
                    <select
                        id="ward-area-type"
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
                                value: gp.id,
                                label: gp.name,
                            }))}
                            value={gpId}
                            onChange={(value) => {
                                setGpId(value || "");
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
                                <span className="fw-semibold">
                                    * NAC:
                                </span>
                            )}
                            options={(nacs ?? []).map((nac) => ({
                                value: nac.id,
                                label: nac.name,
                            }))}
                            value={nacId}
                            onChange={(value) => {
                                setNacId(value || "");
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
                    <label className="form-label" htmlFor="create-ward-name">
                        <span className="text-dark fw-semibold">* Ward Name:</span>
                    </label>
                    <input
                        id="create-ward-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter ward name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "create-ward-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="create-ward-name-error" className="invalid-feedback d-block mt-2">
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
                    disabled={actionLoading || (areaType === "rural" ? !gpId : !nacId) || !name.trim()}
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