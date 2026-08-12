import { create } from "zustand";

const API_BASE = "/api/v1/location";

const endpoints = {
    states: `${API_BASE}/states`,
    districts: `${API_BASE}/districts`,
    blocks: `${API_BASE}/blocks`,
    nacs: `${API_BASE}/nacs`,
    gps: `${API_BASE}/gps`,
    villages: `${API_BASE}/villages`,
    wards: `${API_BASE}/wards`,
    booths: `${API_BASE}/booths`,
};

const defaultFilters = {
    page: 1,
    limit: 10,
    search: "",
    stateId: "",
    districtId: "",
    blockId: "",
    nacId: "",
    gpId: "",
    villageId: "",
    wardId: "",
};

const buildFetchKey = (filters) =>
    JSON.stringify(
        Object.entries(filters)
            .filter(([, value]) => value !== "" && value !== null && value !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
    );

export const useLocationStore = create((set, get) => ({
    states: [],
    districts: [],
    blocks: [],
    nacs: [],
    gps: [],
    villages: [],
    wards: [],
    booths: [],

    dropdownCache: {
        states: [],
        districts: [],
        blocks: [],
        nacs: [],
        gps: [],
        villages: [],
        wards: [],
        booths: [],
    },

    loading: false,
    actionLoading: false,
    error: null,

    hasFetched: {
        states: false,
        districts: false,
        blocks: false,
        nacs: false,
        gps: false,
        villages: false,
        wards: false,
        booths: false,
    },

    fetchKeys: {
        states: "",
        districts: "",
        blocks: "",
        nacs: "",
        gps: "",
        villages: "",
        wards: "",
        booths: "",
    },

    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    },

    filters: { ...defaultFilters },

    setFilter: (key, value, type = null) => {
        set((state) => {
            const nextFilters = {
                ...state.filters,
                [key]: value,
                page: key === "page" ? value : 1,
            };

            const nextHasFetched = { ...state.hasFetched };

            if (type) {
                nextHasFetched[type] = false;
            } else {
                Object.keys(nextHasFetched).forEach((entity) => {
                    nextHasFetched[entity] = false;
                });
            }

            return {
                filters: nextFilters,
                hasFetched: nextHasFetched,
            };
        });
    },

    resetFilters: () => {
        set({
            filters: { ...defaultFilters },
            hasFetched: {
                states: false,
                districts: false,
                blocks: false,
                nacs: false,
                gps: false,
                villages: false,
                wards: false,
                booths: false,
            },
            fetchKeys: {
                states: "",
                districts: "",
                blocks: "",
                nacs: "",
                gps: "",
                villages: "",
                wards: "",
                booths: "",
            },
        });
    },

    initListView: (type) => {
        set((state) => ({
            filters: { ...defaultFilters },
            hasFetched: {
                ...state.hasFetched,
                [type]: false,
            },
            fetchKeys: {
                ...state.fetchKeys,
                [type]: "",
            },
        }));
    },

    getLocationById: async (type, id) => {
        try {
            set({ actionLoading: true, error: null });

            const res = await fetch(`${endpoints[type]}/${id}`);
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch location data");
            }

            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } catch (error) {
            set({ error: error.message });

            return {
                success: false,
                data: null,
                message: error.message,
            };
        } finally {
            set({ actionLoading: false });
        }
    },

    fetchDropdown: async (type, query = {}) => {
        try {
            const params = new URLSearchParams({
                page: "1",
                limit: "1000",
            });

            Object.entries(query).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const res = await fetch(`${endpoints[type]}?${params.toString()}`);
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch options");
            }

            const data = result.data || [];

            set((state) => ({
                dropdownCache: {
                    ...state.dropdownCache,
                    [type]: data,
                },
            }));

            return data;
        } catch (error) {
            set({ error: error.message });
            return [];
        }
    },

    fetchLocations: async (type, force = false) => {
        try {
            const { filters, hasFetched, fetchKeys } = get();
            const fetchKey = buildFetchKey(filters);

            if (!force && hasFetched[type] && fetchKeys[type] === fetchKey) {
                return {
                    success: true,
                    data: get()[type],
                    message: "Cached data",
                };
            }

            set({ loading: true, error: null });

            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const res = await fetch(`${endpoints[type]}?${params.toString()}`);
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch data");
            }

            set((state) => ({
                [type]: result.data || [],
                pagination: result.pagination || state.pagination,
                hasFetched: {
                    ...state.hasFetched,
                    [type]: true,
                },
                fetchKeys: {
                    ...state.fetchKeys,
                    [type]: fetchKey,
                },
                loading: false,
            }));

            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } catch (error) {
            set({
                error: error.message,
                loading: false,
            });

            return {
                success: false,
                message: error.message,
            };
        }
    },

    createLocation: async (type, payload) => {
        try {
            set({ actionLoading: true, error: null });

            const res = await fetch(endpoints[type], {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to create");
            }

            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
                fetchKeys: {
                    ...state.fetchKeys,
                    [type]: "",
                },
            }));

            await get().fetchLocations(type, true);

            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } catch (error) {
            set({ error: error.message });

            return {
                success: false,
                message: error.message,
            };
        } finally {
            set({ actionLoading: false });
        }
    },

    updateLocation: async (type, id, payload) => {
        try {
            set({ actionLoading: true, error: null });

            const res = await fetch(`${endpoints[type]}/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to update");
            }

            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
                fetchKeys: {
                    ...state.fetchKeys,
                    [type]: "",
                },
            }));

            await get().fetchLocations(type, true);

            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } catch (error) {
            set({ error: error.message });

            return {
                success: false,
                message: error.message,
            };
        } finally {
            set({ actionLoading: false });
        }
    },

    deleteLocation: async (type, id) => {
        try {
            set({ actionLoading: true, error: null });

            const res = await fetch(`${endpoints[type]}/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to delete");
            }

            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
                fetchKeys: {
                    ...state.fetchKeys,
                    [type]: "",
                },
            }));

            await get().fetchLocations(type, true);

            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            set({ error: error.message });

            return {
                success: false,
                message: error.message,
            };
        } finally {
            set({ actionLoading: false });
        }
    },
}));
