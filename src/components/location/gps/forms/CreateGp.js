"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";
import { Icon } from "@iconify/react";

export default function CreateGp({ onSuccess }) {
    const [blockId, setBlockId] = useState("");
    const [name, setName] = useState("");
    const [fieldError, setFieldError] = useState("");

    const {
        blocks,
        fetchLocations,
        createLocation,
        actionLoading,
        hasFetched,
    } = useLocationStore();

    useEffect(() => {
        if (!hasFetched.blocks) {
            fetchLocations("blocks", true);
        }
    }, [fetchLocations, hasFetched.blocks]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!blockId) {
            const errorMsg = "Please select a block";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!trimmedName) {
            const errorMsg = "GP name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        const response = await createLocation("gps", {
            blockId: parseInt(blockId),
            name: trimmedName,
        });

        if (response.success) {
            toast.success(response.message || "GP created successfully");
            setBlockId("");
            setName("");
            onSuccess?.();
        } else {
            const errorMsg = response.message || "Failed to create GP";
            setFieldError(errorMsg);
            toast.error(errorMsg);
        }
    }, [blockId, createLocation, name, onSuccess]);

    const handleBlockChange = useCallback((value) => {
        setBlockId(value || "");
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
                    <SearchSelect
                        label={(
                            <span className="text-dark fw-semibold">
                                * Block:
                            </span>
                        )}
                        options={blocks.map((block) => ({
                            value: block.id,
                            label: block.name,
                        }))}
                        value={blockId}
                        onChange={handleBlockChange}
                        placeholder="Search & Select Block"
                        isDisabled={actionLoading}
                        required
                    />
                    {fieldError && !blockId && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="create-gp-name">
                        <span className="text-dark fw-semibold">* GP Name:</span>
                    </label>
                    <input
                        id="create-gp-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter GP name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={actionLoading}
                        required
                        autoFocus
                        aria-invalid={Boolean(fieldError && !name.trim())}
                        aria-describedby={fieldError && !name.trim() ? "create-gp-name-error" : undefined}
                    />
                    {fieldError && !name.trim() && (
                        <div id="create-gp-name-error" className="invalid-feedback d-block mt-2">
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
                    disabled={actionLoading || !blockId || !name.trim()}
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