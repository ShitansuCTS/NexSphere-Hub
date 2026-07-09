"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateBooth({ onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [nacId, setNacId] = useState("");
    const [wardId, setWardId] = useState("");
    const [name, setName] = useState("");

    const {
        gps,
        nacs,
        wards,
        fetchLocations,
        createLocation,
        actionLoading,
    } = useLocationStore();

    useEffect(() => {
        fetchLocations("gps");
        fetchLocations("nacs");
        fetchLocations("wards");
    }, [fetchLocations]);

    // Filter wards according to selected area
    const filteredWards = (wards ?? []).filter((ward) => {
        if (areaType === "rural") {
            return ward.gpId === gpId;
        }
        return ward.nacId === nacId;
    });

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await createLocation("booths", {
            areaType,
            wardId,
            name: name.trim(),
        });

        if (response.success) {
            toast.success(response.message || "Booth created successfully");

            setAreaType("rural");
            setGpId("");
            setNacId("");
            setWardId("");
            setName("");

            onSuccess?.();
        } else {
            toast.error(response.message || "Failed to create booth");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* Area Type */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Area Type
                    </label>

                    <select
                        className="form-select"
                        value={areaType}
                        onChange={(e) => {
                            setAreaType(e.target.value);
                            setGpId("");
                            setNacId("");
                            setWardId("");
                        }}
                        disabled={actionLoading}
                    >
                        <option value="rural">Rural</option>
                        <option value="urban">Urban</option>
                    </select>
                </div>

                {/* GP */}
                {areaType === "rural" && (
                    <div className="col-12 mb-3">
                        <label className="form-label">
                            Gram Panchayat
                        </label>

                        <SearchSelect
                            options={(gps ?? []).map((gp) => ({
                                value: gp.id,
                                label: gp.name,
                            }))}
                            value={gpId}
                            onChange={(value) => {
                                setGpId(value);
                                setWardId("");
                            }}
                            placeholder="Search & Select GP"
                            isDisabled={actionLoading}
                        />
                    </div>
                )}

                {/* NAC */}
                {areaType === "urban" && (
                    <div className="col-12 mb-3">
                        <label className="form-label">
                            NAC
                        </label>

                        <SearchSelect
                            options={(nacs ?? []).map((nac) => ({
                                value: nac.id,
                                label: nac.name,
                            }))}
                            value={nacId}
                            onChange={(value) => {
                                setNacId(value);
                                setWardId("");
                            }}
                            placeholder="Search & Select NAC"
                            isDisabled={actionLoading}
                        />
                    </div>
                )}

                {/* Ward */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Ward
                    </label>

                    <SearchSelect
                        options={filteredWards.map((ward) => ({
                            value: ward.id,
                            label: ward.name,
                        }))}
                        value={wardId}
                        onChange={setWardId}
                        placeholder="Search & Select Ward"
                        isDisabled={
                            actionLoading ||
                            (areaType === "rural" ? !gpId : !nacId)
                        }
                    />
                </div>

                {/* Booth Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Booth Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter booth name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={actionLoading}
                        required
                    />
                </div>

            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">

                <button
                    type="button"
                    className="btn btn-light"
                    onClick={onSuccess}
                    disabled={actionLoading}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading || !wardId}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                        </>
                    ) : (
                        "Save"
                    )}
                </button>

            </div>
        </form>
    );
}