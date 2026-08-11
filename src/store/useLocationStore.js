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

export const useLocationStore = create((set, get) => ({
    states: [],
    districts: [],
    blocks: [],
    nacs: [],
    gps: [],
    villages: [],
    wards: [],
    booths: [],

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

    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    },

    filters: {
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
    },

    // Track if initial fetch has been done
    _initialized: {
        states: false,
        districts: false,
        blocks: false,
        nacs: false,
        gps: false,
        villages: false,
        wards: false,
        booths: false,
    },

    setFilter: (key, value) => {
        set((state) => {
            // Only reset hasFetched when search or limit changes
            const shouldResetCache = key === 'search' || key === 'limit';
            const newState = {
                filters: {
                    ...state.filters,
                    [key]: value,
                    page: key === "page" ? value : 1,
                },
            };

            // Reset hasFetched for states when search changes
            if (shouldResetCache) {
                newState.hasFetched = {
                    ...state.hasFetched,
                    states: false,
                };
            }

            return newState;
        });
    },

    resetFilters: () => {
        set({
            filters: {
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
            },
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
        });
    },

    // GET single location by ID
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

    fetchLocations: async (type, force = false) => {
        try {
            const { filters, hasFetched } = get();

            // Skip if already fetched and not forced
            if (hasFetched[type] && !force) {
                return;
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

            // Reset hasFetched to force refresh
            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
            }));

            // Force refresh after creating
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

            // Reset hasFetched to force refresh
            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
            }));

            // Force refresh after updating
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

            // Reset hasFetched to force refresh
            set((state) => ({
                hasFetched: {
                    ...state.hasFetched,
                    [type]: false,
                },
            }));

            // Force refresh after deleting
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