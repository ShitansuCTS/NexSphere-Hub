"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

export default function CreateWard({ onSuccess }) {
    const [areaType, setAreaType] = useState("rural");
    const [gpId, setGpId] = useState("");
    const [nacId, setNacId] = useState("");
    const [name, setName] = useState("");

    const {
        gps,
        nacs,
        fetchLocations,
        createLocation,
        actionLoading,
    } = useLocationStore();

    useEffect(() => {
        fetchLocations("gps");
        fetchLocations("nacs");
    }, [fetchLocations]);

    async function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            areaType,
            name: name.trim(),
        };

        if (areaType === "rural") {
            payload.gpId = gpId;
        } else {
            payload.nacId = nacId;
        }

        const response = await createLocation("wards", payload);

        if (response.success) {
            toast.success(response.message || "Ward created successfully");

            setAreaType("rural");
            setGpId("");
            setNacId("");
            setName("");

            onSuccess?.();
        } else {
            toast.error(response.message || "Failed to create ward");
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
                            onChange={setGpId}
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
                            onChange={setNacId}
                            placeholder="Search & Select NAC"
                            isDisabled={actionLoading}
                        />
                    </div>
                )}

                {/* Ward Name */}
                <div className="col-12 mb-3">
                    <label className="form-label">
                        Ward Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter ward name"
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
                    disabled={
                        actionLoading ||
                        (areaType === "rural" ? !gpId : !nacId)
                    }
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