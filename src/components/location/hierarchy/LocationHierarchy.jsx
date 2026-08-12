"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useLocationStore } from "@/store/useLocationStore";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import { buildHierarchyUrl } from "@/utils/locationHierarchyUrl";

const API_BASE = "/api/v1/location";

async function fetchLevelItems(type, query = {}) {
    const params = new URLSearchParams({ page: "1", limit: "1000" });

    Object.entries(query).forEach(([key, value]) => {
        if (value) {
            params.append(key, value);
        }
    });

    const res = await fetch(`${API_BASE}/${type}?${params.toString()}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load locations");
    }

    return result.data || [];
}

const LEVEL_META = {
    states: { label: "State", icon: "mdi:map-marker-radius" },
    districts: { label: "District", icon: "mdi:city-variant-outline" },
    blocks: { label: "Block", icon: "mdi:home-group" },
    nacs: { label: "NAC", icon: "mdi:office-building-marker" },
    gps: { label: "Gram Panchayat", icon: "mdi:account-group-outline" },
    villages: { label: "Village", icon: "mdi:home-map-marker" },
    wards: { label: "Ward", icon: "mdi:map-marker-multiple" },
    booths: { label: "Booth", icon: "mdi:vote" },
};

export default function LocationHierarchy() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getLocationById } = useLocationStore();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [labels, setLabels] = useState({});

    const stateId = searchParams.get("stateId") || "";
    const districtId = searchParams.get("districtId") || "";
    const areaType = searchParams.get("areaType") || "";
    const blockId = searchParams.get("blockId") || "";
    const nacId = searchParams.get("nacId") || "";
    const gpId = searchParams.get("gpId") || "";
    const villageId = searchParams.get("villageId") || "";
    const wardId = searchParams.get("wardId") || "";

    const currentLevel = useMemo(() => {
        if (wardId) return "booths";
        if (villageId || nacId) return "wards";
        if (gpId) return "villages";
        if (blockId) return "gps";
        if (areaType === "urban" && districtId) return "nacs";
        if (areaType === "rural" && districtId) return "blocks";
        if (districtId) return "areaChoice";
        if (stateId) return "districts";
        return "states";
    }, [stateId, districtId, areaType, blockId, nacId, gpId, villageId, wardId]);

    const breadcrumbs = useMemo(() => {
        const crumbs = [{ key: "root", label: "All States", href: buildHierarchyUrl({}) }];

        if (stateId && labels.state) {
            crumbs.push({
                key: "state",
                label: labels.state,
                href: buildHierarchyUrl({ stateId }),
            });
        }

        if (districtId && labels.district) {
            crumbs.push({
                key: "district",
                label: labels.district,
                href: buildHierarchyUrl({ stateId, districtId }),
            });
        }

        if (areaType === "rural" && blockId && labels.block) {
            crumbs.push({
                key: "block",
                label: labels.block,
                href: buildHierarchyUrl({ stateId, districtId, areaType, blockId }),
            });
        }

        if (areaType === "rural" && gpId && labels.gp) {
            crumbs.push({
                key: "gp",
                label: labels.gp,
                href: buildHierarchyUrl({ stateId, districtId, areaType, blockId, gpId }),
            });
        }

        if (areaType === "rural" && villageId && labels.village) {
            crumbs.push({
                key: "village",
                label: labels.village,
                href: buildHierarchyUrl({
                    stateId,
                    districtId,
                    areaType,
                    blockId,
                    gpId,
                    villageId,
                }),
            });
        }

        if (areaType === "urban" && nacId && labels.nac) {
            crumbs.push({
                key: "nac",
                label: labels.nac,
                href: buildHierarchyUrl({ stateId, districtId, areaType, nacId }),
            });
        }

        if (wardId && labels.ward) {
            crumbs.push({
                key: "ward",
                label: labels.ward,
                href: buildHierarchyUrl({
                    stateId,
                    districtId,
                    areaType,
                    blockId,
                    nacId,
                    gpId,
                    villageId,
                    wardId,
                }),
            });
        }

        return crumbs;
    }, [stateId, districtId, areaType, blockId, nacId, gpId, villageId, wardId, labels]);

    const loadLabels = useCallback(async () => {
        const nextLabels = {};

        if (stateId) {
            const res = await getLocationById("states", stateId);
            if (res.success) nextLabels.state = res.data.name;
        }

        if (districtId) {
            const res = await getLocationById("districts", districtId);
            if (res.success) nextLabels.district = res.data.name;
        }

        if (blockId) {
            const res = await getLocationById("blocks", blockId);
            if (res.success) nextLabels.block = res.data.name;
        }

        if (nacId) {
            const res = await getLocationById("nacs", nacId);
            if (res.success) nextLabels.nac = res.data.name;
        }

        if (gpId) {
            const res = await getLocationById("gps", gpId);
            if (res.success) nextLabels.gp = res.data.name;
        }

        if (villageId) {
            const res = await getLocationById("villages", villageId);
            if (res.success) nextLabels.village = res.data.name;
        }

        if (wardId) {
            const res = await getLocationById("wards", wardId);
            if (res.success) nextLabels.ward = res.data.name;
        }

        setLabels(nextLabels);
    }, [
        blockId,
        districtId,
        getLocationById,
        gpId,
        nacId,
        stateId,
        villageId,
        wardId,
    ]);

    const loadItems = useCallback(async () => {
        if (currentLevel === "areaChoice") {
            setItems([]);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let data = [];

            switch (currentLevel) {
                case "states":
                    data = await fetchLevelItems("states");
                    break;
                case "districts":
                    data = await fetchLevelItems("districts", { stateId });
                    break;
                case "blocks":
                    data = await fetchLevelItems("blocks", { districtId });
                    break;
                case "nacs":
                    data = await fetchLevelItems("nacs", { districtId });
                    break;
                case "gps":
                    data = await fetchLevelItems("gps", { blockId });
                    break;
                case "villages":
                    data = await fetchLevelItems("villages", { gpId });
                    break;
                case "wards":
                    data = await fetchLevelItems("wards", {
                        ...(villageId ? { villageId } : {}),
                        ...(nacId ? { nacId } : {}),
                    });
                    break;
                case "booths":
                    data = await fetchLevelItems("booths", { wardId });
                    break;
                default:
                    data = [];
            }

            setItems(data);
        } catch (err) {
            setError(err.message || "Failed to load hierarchy data");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentLevel, stateId, districtId, blockId, nacId, gpId, villageId, wardId]);

    useEffect(() => {
        loadLabels();
    }, [loadLabels]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) => item.name?.toLowerCase().includes(term));
    }, [items, search]);

    const navigateTo = useCallback(
        (params) => {
            router.push(buildHierarchyUrl(params));
        },
        [router]
    );

    const handleItemClick = useCallback(
        (item) => {
            switch (currentLevel) {
                case "states":
                    navigateTo({ stateId: item.id });
                    break;
                case "districts":
                    navigateTo({ stateId, districtId: item.id });
                    break;
                case "blocks":
                    navigateTo({
                        stateId,
                        districtId,
                        areaType: "rural",
                        blockId: item.id,
                    });
                    break;
                case "nacs":
                    navigateTo({
                        stateId,
                        districtId,
                        areaType: "urban",
                        nacId: item.id,
                    });
                    break;
                case "gps":
                    navigateTo({
                        stateId,
                        districtId,
                        areaType: "rural",
                        blockId,
                        gpId: item.id,
                    });
                    break;
                case "villages":
                    navigateTo({
                        stateId,
                        districtId,
                        areaType: "rural",
                        blockId,
                        gpId,
                        villageId: item.id,
                    });
                    break;
                case "wards":
                    navigateTo({
                        stateId,
                        districtId,
                        areaType,
                        blockId,
                        nacId,
                        gpId,
                        villageId,
                        wardId: item.id,
                    });
                    break;
                default:
                    break;
            }
        },
        [
            areaType,
            blockId,
            currentLevel,
            districtId,
            gpId,
            nacId,
            navigateTo,
            stateId,
            villageId,
        ]
    );

    const levelTitle = useMemo(() => {
        if (currentLevel === "areaChoice") {
            return "Choose Area Type";
        }

        const meta = LEVEL_META[currentLevel];
        return meta ? `${meta.label}s` : "Locations";
    }, [currentLevel]);

    if (loading && currentLevel !== "areaChoice") {
        return (
            <div className="row g-3">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div className="col-xl-3 col-sm-6" key={index}>
                        <div className="card p-3">
                            <SkeletonLoader height={24} width="70%" />
                            <SkeletonLoader height={16} width="40%" className="mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="card shadow-sm mb-3 p-3">
                <nav aria-label="Location hierarchy breadcrumb">
                    <ol className="breadcrumb mb-0 flex-wrap">
                        {breadcrumbs.map((crumb, index) => (
                            <li
                                key={crumb.key}
                                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? "active" : ""}`}
                            >
                                {index === breadcrumbs.length - 1 ? (
                                    crumb.label
                                ) : (
                                    <Link href={crumb.href}>{crumb.label}</Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            <div className="card shadow-sm mb-3 p-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <h5 className="mb-1">{levelTitle}</h5>
                        <p className="text-secondary-light mb-0 small">
                            {areaType === "rural" && "Rural hierarchy"}
                            {areaType === "urban" && "Urban hierarchy"}
                            {!areaType && currentLevel !== "areaChoice" && "Select a location to drill down"}
                        </p>
                    </div>

                    {currentLevel !== "areaChoice" && (
                        <div className="navbar-search">
                            <input
                                type="text"
                                className="form-control bg-base"
                                placeholder={`Search ${levelTitle.toLowerCase()}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="card border-danger-subtle p-4 text-center mb-3">
                    <p className="text-danger mb-3">{error}</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={loadItems}>
                        Try Again
                    </button>
                </div>
            )}

            {currentLevel === "areaChoice" && (
                <div className="row g-3">
                    <div className="col-md-6">
                        <button
                            type="button"
                            className="card h-100 w-100 border-0 text-start p-4"
                            onClick={() =>
                                navigateTo({ stateId, districtId, areaType: "rural" })
                            }
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="w-48-px h-48-px rounded-circle bg-success-focus text-success-main d-flex align-items-center justify-content-center">
                                    <Icon icon="mdi:home-group" className="text-xl" />
                                </div>
                                <div>
                                    <h6 className="mb-1">Rural Hierarchy</h6>
                                    <p className="mb-0 text-secondary-light small">
                                        Block → GP → Village → Ward → Booth
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="col-md-6">
                        <button
                            type="button"
                            className="card h-100 w-100 border-0 text-start p-4"
                            onClick={() =>
                                navigateTo({ stateId, districtId, areaType: "urban" })
                            }
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="w-48-px h-48-px rounded-circle bg-warning-focus text-warning-main d-flex align-items-center justify-content-center">
                                    <Icon icon="mdi:office-building-marker" className="text-xl" />
                                </div>
                                <div>
                                    <h6 className="mb-1">Urban Hierarchy</h6>
                                    <p className="mb-0 text-secondary-light small">
                                        NAC → Ward → Booth
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {currentLevel !== "areaChoice" && (
                <div className="card h-100 rounded-4 overflow-hidden">
                    <div className="card-body p-20">
                        <div className="row row-cols-xxl-4 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 gy-4">
                            {filteredItems.map((item) => {
                                const meta = LEVEL_META[currentLevel] || LEVEL_META.states;
                                const isLeaf = currentLevel === "booths";

                                return (
                                    <div className="col" key={item.id}>
                                        <button
                                            type="button"
                                            className="card shadow-none border h-100 px-2 py-2 rounded-3 border border-neutral-200 w-100 text-start"
                                            onClick={() => !isLeaf && handleItemClick(item)}
                                            disabled={isLeaf}
                                        >
                                            <div className="card-body p-20">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="w-48-px h-48-px rounded-circle bg-primary-50 text-primary d-flex align-items-center justify-content-center flex-shrink-0">
                                                        <Icon icon={meta.icon} className="text-xl" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h6 className="mb-0 fw-semibold text-truncate">
                                                            {item.name}
                                                        </h6>
                                                        <span className="text-secondary-light small">
                                                            {isLeaf ? "Booth" : `View ${meta.label}s`}
                                                        </span>
                                                    </div>
                                                    {!isLeaf && (
                                                        <Icon
                                                            icon="ep:d-arrow-right"
                                                            className="ms-auto text-secondary-light"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}

                            {filteredItems.length === 0 && !error && (
                                <div className="col-12">
                                    <div className="card border text-center py-5">
                                        <Icon
                                            icon="mdi:map-outline"
                                            className="text-secondary-light text-4xl mb-3"
                                        />
                                        <h6 className="mb-1">No {levelTitle} Found</h6>
                                        <p className="text-secondary-light mb-0">
                                            No locations available at this level.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
