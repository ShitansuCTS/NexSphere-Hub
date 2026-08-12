"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateBooth({ onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [nacId, setNacId] = useState("");
    const [wardId, setWardId] = useState("");
    const [name, setName] = useState("");
    const [fieldError, setFieldError] = useState("");

    const {
        dropdownCache,
        fetchDropdown,
        createLocation,
        actionLoading,
    } = useLocationStore();

    const gps = dropdownCache.gps;
    const nacs = dropdownCache.nacs;
    const wards = dropdownCache.wards;

    useEffect(() => {
        fetchDropdown("gps");
        fetchDropdown("nacs");
    }, [fetchDropdown]);

    useEffect(() => {
        setWardId("");

        if (areaType === "rural" && gpId) {
            fetchDropdown("wards", { gpId });
            return;
        }

        if (areaType === "urban" && nacId) {
            fetchDropdown("wards", { nacId });
        }
    }, [areaType, gpId, nacId, fetchDropdown]);

    const wardOptions = useMemo(() => {
        return wards.map((ward) => ({
            value: ward.id,
            label: ward.name,
        }));
    }, [wards]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            const errorMessage = "Booth name is required";
            setFieldError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        if ((areaType === "rural" && !gpId) || (areaType === "urban" && !nacId)) {
            const errorMessage = areaType === "rural" ? "Please select a GP" : "Please select a NAC";
            setFieldError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        if (!wardId) {
            const errorMessage = "Please select a ward";
            setFieldError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setFieldError("");

        const response = await createLocation("booths", {
            wardId,
            name: trimmedName,
        });

        if (response.success) {
            toast.success(response.message || "Booth created successfully");

            setAreaType("rural");
            setGpId("");
            setNacId("");
            setWardId("");
            setName("");
            setFieldError("");

            onSuccess?.();
        } else {
            const errorMessage = response.message || "Failed to create booth";
            setFieldError(errorMessage);
            toast.error(errorMessage);
        }
    }, [areaType, createLocation, gpId, nacId, name, onSuccess, wardId]);

    const handleAreaTypeChange = useCallback((e) => {
        const nextType = e.target.value;
        setAreaType(nextType);
        setGpId("");
        setNacId("");
        setWardId("");
        setFieldError("");
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold" htmlFor="create-booth-area-type">
                        * Area Type:
                    </label>

                    <select
                        id="create-booth-area-type"
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
                                <span className="fw-semibold">
                                    * Gram Panchayat:
                                </span>
                            )}
                            options={gps.map((gp) => ({
                                value: gp.id,
                                label: gp.name,
                            }))}
                            value={gpId}
                            onChange={(value) => {
                                setGpId(value || "");
                                setWardId("");
                                setFieldError("");
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
                            options={nacs.map((nac) => ({
                                value: nac.id,
                                label: nac.name,
                            }))}
                            value={nacId}
                            onChange={(value) => {
                                setNacId(value || "");
                                setWardId("");
                                setFieldError("");
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
                            <span className="fw-semibold">
                                * Ward:
                            </span>
                        )}
                        options={wardOptions}
                        value={wardId}
                        onChange={(value) => {
                            setWardId(value || "");
                            setFieldError("");
                        }}
                        placeholder="Search & Select Ward"
                        isDisabled={
                            actionLoading ||
                            (areaType === "rural" ? !gpId : !nacId)
                        }
                        required
                    />
                    {fieldError && !wardId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label fw-semibold" htmlFor="create-booth-name">
                        * Booth Name:
                    </label>

                    <input
                        id="create-booth-name"
                        type="text"
                        className={`form-control form-control-lg ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter booth name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (fieldError) {
                                setFieldError("");
                            }
                        }}
                        disabled={actionLoading}
                        required
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "create-booth-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="create-booth-name-error" className="invalid-feedback d-block mt-2">
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
                    className="btn btn-primary"
                    disabled={actionLoading || !wardId || !name.trim()}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:content-save" className="me-1" />
                            Save Booth
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
