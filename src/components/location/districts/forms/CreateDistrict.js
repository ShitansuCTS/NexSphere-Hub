"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateDistrict({ onSuccess }) {
    const [stateId, setStateId] = useState("");
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({ stateId: "", name: "" });

    const {
        dropdownCache,
        fetchDropdown,
        createLocation,
        actionLoading,
    } = useLocationStore();

    const states = dropdownCache.states;

    useEffect(() => {
        fetchDropdown("states");
    }, [fetchDropdown]);

    const validateForm = useCallback(() => {
        const nextErrors = { stateId: "", name: "" };

        if (!stateId) {
            nextErrors.stateId = "Please select a state";
        }

        if (!name.trim()) {
            nextErrors.name = "District name is required";
        }

        setErrors(nextErrors);
        return !nextErrors.stateId && !nextErrors.name;
    }, [name, stateId]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = errors.stateId || errors.name;
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }


        const response = await createLocation("districts", {
            stateId: stateId,
            name: name.trim(),
        });

        // console.log("CREATE DISTRICT RESPONSE:", response);
        // console.log("CREATED DISTRICT:", response.data);
        // console.log("STATE ID:", response.data?.stateId);

        if (response.success) {
            toast.success(response.message || "District created successfully");
            setStateId("");
            setName("");
            setErrors({ stateId: "", name: "" });
            onSuccess?.();
        } else {
            const serverError = response.message || "Failed to create district";
            setErrors((prev) => ({ ...prev, name: serverError }));
            toast.error(serverError);
        }
    }, [stateId, name, createLocation, onSuccess, validateForm, errors.name, errors.stateId]);

    const handleCancel = useCallback(() => {
        setStateId("");
        setName("");
        setErrors({ stateId: "", name: "" });
        onSuccess?.();
    }, [onSuccess]);

    const handleStateChange = useCallback((value) => {
        setStateId(value || "");
        if (errors.stateId) {
            setErrors((prev) => ({ ...prev, stateId: "" }));
        }
    }, [errors.stateId]);

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
                                <span className="text-dark fw-semibold">
                                    * State:
                                </span>
                            )}
                            options={states.map((state) => ({
                                value: state.id,
                                label: state.name,
                            }))}
                            value={stateId}
                            onChange={handleStateChange}
                            placeholder="Search & Select State"
                            isDisabled={actionLoading}
                            required
                        />
                        {errors.stateId && (
                            <div id="district-state-error" className="invalid-feedback d-block mt-2">
                                {errors.stateId}
                            </div>
                        )}
                        {states.length === 0 && !actionLoading && (
                            <small className="text-warning d-block mt-2">
                                No states available. Please add a state first.
                            </small>
                        )}
                    </div>

                    <div className="mb-3">

                        <label className="form-label text-dark" htmlFor="district-name">

                            <span className="text-dark fw-semibold">
                                * District Name:
                            </span>

                        </label>
                        <input
                            id="district-name"
                            type="text"
                            className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
                            placeholder="Enter district name"
                            value={name}
                            onChange={handleNameChange}
                            disabled={actionLoading}
                            required
                            autoFocus
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? "district-name-error" : undefined}
                        />
                        {errors.name && (
                            <div id="district-name-error" className="invalid-feedback d-block mt-2">
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
                    disabled={actionLoading || !stateId || !name.trim()}
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