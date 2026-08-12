"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useContactStore } from "@/store/useContactStore";
import { useLocationStore } from "@/store/useLocationStore";
import SearchSelect from "@/components/ui/searchselect/SearchSelect";

const defaultLocationFilters = {
    stateId: "",
    districtId: "",
    areaType: "",
    blockId: "",
    nacId: "",
    gpId: "",
    villageId: "",
    wardId: "",
    boothId: "",
};

export default function ContactFilters() {
    const { filters, setFilters, resetFilters, fetchContacts } = useContactStore();
    const { fetchDropdown, dropdownCache } = useLocationStore();

    const [searchInput, setSearchInput] = useState(filters.search || "");
    const areaType = filters.areaType || "";

    useEffect(() => {
        fetchDropdown("states");
    }, [fetchDropdown]);

    useEffect(() => {
        if (filters.stateId) {
            fetchDropdown("districts", { stateId: filters.stateId });
        }
    }, [filters.stateId, fetchDropdown]);

    useEffect(() => {
        if (filters.districtId && areaType === "rural") {
            fetchDropdown("blocks", { districtId: filters.districtId });
        }
        if (filters.districtId && areaType === "urban") {
            fetchDropdown("nacs", { districtId: filters.districtId });
        }
    }, [filters.districtId, areaType, fetchDropdown]);

    useEffect(() => {
        if (filters.blockId) {
            fetchDropdown("gps", { blockId: filters.blockId });
        }
    }, [filters.blockId, fetchDropdown]);

    useEffect(() => {
        if (filters.gpId) {
            fetchDropdown("villages", { gpId: filters.gpId });
        }
    }, [filters.gpId, fetchDropdown]);

    useEffect(() => {
        if (filters.villageId) {
            fetchDropdown("wards", { villageId: filters.villageId });
        }
        if (filters.nacId) {
            fetchDropdown("wards", { nacId: filters.nacId });
        }
    }, [filters.villageId, filters.nacId, fetchDropdown]);

    useEffect(() => {
        if (filters.wardId) {
            fetchDropdown("booths", { wardId: filters.wardId });
        }
    }, [filters.wardId, fetchDropdown]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({ search: searchInput, page: 1 });
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput, setFilters]);

    useEffect(() => {
        fetchContacts();
    }, [
        fetchContacts,
        filters.page,
        filters.limit,
        filters.search,
        filters.stateId,
        filters.districtId,
        filters.blockId,
        filters.nacId,
        filters.gpId,
        filters.villageId,
        filters.wardId,
        filters.boothId,
    ]);

    const handleStateChange = (value) => {
        setFilters({
            ...defaultLocationFilters,
            areaType: "",
            stateId: value || "",
            search: searchInput,
            page: 1,
        });
    };

    const handleDistrictChange = (value) => {
        setFilters({
            stateId: filters.stateId,
            ...defaultLocationFilters,
            areaType: "",
            districtId: value || "",
            search: searchInput,
            page: 1,
        });
    };

    const handleAreaTypeChange = (value) => {
        setFilters({
            stateId: filters.stateId,
            districtId: filters.districtId,
            areaType: value,
            blockId: "",
            nacId: "",
            gpId: "",
            villageId: "",
            wardId: "",
            boothId: "",
            search: searchInput,
            page: 1,
        });
    };

    const handleClear = () => {
        setSearchInput("");
        resetFilters();
    };

    const hasActiveFilters =
        Boolean(searchInput) ||
        Boolean(filters.stateId) ||
        Boolean(filters.districtId) ||
        Boolean(areaType) ||
        Boolean(filters.blockId) ||
        Boolean(filters.nacId) ||
        Boolean(filters.gpId) ||
        Boolean(filters.villageId) ||
        Boolean(filters.wardId) ||
        Boolean(filters.boothId);

    return (
        <div className="card shadow-sm mb-3 p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h6 className="mb-1 fw-semibold">Filter Contacts</h6>
                    <p className="text-secondary-light mb-0 small">
                        Search by name, mobile, or email. Narrow results by location hierarchy.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={handleClear}
                    >
                        <Icon icon="mdi:filter-off-outline" />
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label small fw-semibold mb-1">Search</label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Name, mobile, or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <SearchSelect
                        label={<span className="small fw-semibold">State</span>}
                        options={dropdownCache.states.map((state) => ({
                            value: state.id,
                            label: state.name,
                        }))}
                        value={filters.stateId}
                        onChange={handleStateChange}
                        placeholder="All states"
                    />
                </div>

                <div className="col-md-4">
                    <SearchSelect
                        label={<span className="small fw-semibold">District</span>}
                        options={dropdownCache.districts.map((district) => ({
                            value: district.id,
                            label: district.name,
                        }))}
                        value={filters.districtId}
                        onChange={handleDistrictChange}
                        placeholder="All districts"
                        isDisabled={!filters.stateId}
                    />
                </div>

                {filters.districtId && (
                    <div className="col-md-4">
                        <label className="form-label small fw-semibold mb-1">Area Type</label>
                        <select
                            className="form-select form-select-sm"
                            value={areaType}
                            onChange={(e) => handleAreaTypeChange(e.target.value)}
                        >
                            <option value="">All areas</option>
                            <option value="rural">Rural</option>
                            <option value="urban">Urban</option>
                        </select>
                    </div>
                )}

                {areaType === "rural" && filters.districtId && (
                    <>
                        <div className="col-md-4">
                            <SearchSelect
                                label={<span className="small fw-semibold">Block</span>}
                                options={dropdownCache.blocks.map((block) => ({
                                    value: block.id,
                                    label: block.name,
                                }))}
                                value={filters.blockId}
                                onChange={(value) =>
                                    setFilters({
                                        blockId: value || "",
                                        gpId: "",
                                        villageId: "",
                                        wardId: "",
                                        boothId: "",
                                        page: 1,
                                    })
                                }
                                placeholder="All blocks"
                            />
                        </div>

                        <div className="col-md-4">
                            <SearchSelect
                                label={<span className="small fw-semibold">GP</span>}
                                options={dropdownCache.gps.map((gp) => ({
                                    value: gp.id,
                                    label: gp.name,
                                }))}
                                value={filters.gpId}
                                onChange={(value) =>
                                    setFilters({
                                        gpId: value || "",
                                        villageId: "",
                                        wardId: "",
                                        boothId: "",
                                        page: 1,
                                    })
                                }
                                placeholder="All GPs"
                                isDisabled={!filters.blockId}
                            />
                        </div>

                        <div className="col-md-4">
                            <SearchSelect
                                label={<span className="small fw-semibold">Village</span>}
                                options={dropdownCache.villages.map((village) => ({
                                    value: village.id,
                                    label: village.name,
                                }))}
                                value={filters.villageId}
                                onChange={(value) =>
                                    setFilters({
                                        villageId: value || "",
                                        wardId: "",
                                        boothId: "",
                                        page: 1,
                                    })
                                }
                                placeholder="All villages"
                                isDisabled={!filters.gpId}
                            />
                        </div>
                    </>
                )}

                {areaType === "urban" && filters.districtId && (
                    <div className="col-md-4">
                        <SearchSelect
                            label={<span className="small fw-semibold">NAC</span>}
                            options={dropdownCache.nacs.map((nac) => ({
                                value: nac.id,
                                label: nac.name,
                            }))}
                            value={filters.nacId}
                            onChange={(value) =>
                                setFilters({
                                    nacId: value || "",
                                    wardId: "",
                                    boothId: "",
                                    page: 1,
                                })
                            }
                            placeholder="All NACs"
                        />
                    </div>
                )}

                {(filters.villageId || filters.nacId) && (
                    <div className="col-md-4">
                        <SearchSelect
                            label={<span className="small fw-semibold">Ward</span>}
                            options={dropdownCache.wards.map((ward) => ({
                                value: ward.id,
                                label: ward.name,
                            }))}
                            value={filters.wardId}
                            onChange={(value) =>
                                setFilters({
                                    wardId: value || "",
                                    boothId: "",
                                    page: 1,
                                })
                            }
                            placeholder="All wards"
                        />
                    </div>
                )}

                {filters.wardId && (
                    <div className="col-md-4">
                        <SearchSelect
                            label={<span className="small fw-semibold">Booth</span>}
                            options={dropdownCache.booths.map((booth) => ({
                                value: booth.id,
                                label: booth.name,
                            }))}
                            value={filters.boothId}
                            onChange={(value) =>
                                setFilters({
                                    boothId: value || "",
                                    page: 1,
                                })
                            }
                            placeholder="All booths"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
