"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateNac({ onSuccess }) {
    const [districtId, setDistrictId] = useState("");
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({ districtId: "", name: "" });

    const {
        dropdownCache,
        fetchDropdown,
        createLocation,
        actionLoading,
    } = useLocationStore();

    const districts = dropdownCache.districts;

    useEffect(() => {
        fetchDropdown("districts");
    }, [fetchDropdown]);

    const validateForm = useCallback(() => {
        const nextErrors = { districtId: "", name: "" };

        if (!districtId) {
            nextErrors.districtId = "Please select a district";
        }

        if (!name.trim()) {
            nextErrors.name = "NAC name is required";
        }

        setErrors(nextErrors);
        return !nextErrors.districtId && !nextErrors.name;
    }, [districtId, name]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = errors.districtId || errors.name;
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }

        const response = await createLocation("nacs", {
            districtId: districtId,
            name: name.trim(),
        });

        if (response.success) {
            toast.success(response.message || "NAC created successfully");
            setDistrictId("");
            setName("");
            setErrors({ districtId: "", name: "" });
            onSuccess?.();
        } else {
            const serverError = response.message || "Failed to create NAC";
            setErrors((prev) => ({ ...prev, name: serverError }));
            toast.error(serverError);
        }
    }, [districtId, name, createLocation, onSuccess, validateForm, errors.districtId, errors.name]);

    const handleCancel = useCallback(() => {
        setDistrictId("");
        setName("");
        setErrors({ districtId: "", name: "" });
        onSuccess?.();
    }, [onSuccess]);

    const handleDistrictChange = useCallback((value) => {
        setDistrictId(value || "");
        if (errors.districtId) {
            setErrors((prev) => ({ ...prev, districtId: "" }));
        }
    }, [errors.districtId]);

    const handleNameChange = useCallback((e) => {
        setName(e.target.value);
        if (errors.name) {
            setErrors((prev) => ({ ...prev, name: "" }));
        }
    }, [errors.name]);

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="card border-0 shadow-none">
                <div className="card-body p-0">


                    <div className="mb-3">
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
                        {errors.districtId && (
                            <div className="invalid-feedback d-block mt-2">{errors.districtId}</div>
                        )}
                        {districts.length === 0 && !actionLoading && (
                            <small className="text-warning d-block mt-2">
                                No districts available. Please add a district first.
                            </small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="nac-name">
                            <span className="fw-semibold text-dark">* NAC Name:</span>
                        </label>
                        <input
                            id="nac-name"
                            type="text"
                            className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
                            placeholder="Enter NAC name"
                            value={name}
                            onChange={handleNameChange}
                            disabled={actionLoading}
                            required
                            autoFocus
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? "nac-name-error" : undefined}
                        />
                        {errors.name && (
                            <div id="nac-name-error" className="invalid-feedback d-block mt-2">
                                {errors.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={actionLoading}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading || !districtId || !name.trim()}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Icon icon="ic:baseline-plus" className="me-1" />
                            Save
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}