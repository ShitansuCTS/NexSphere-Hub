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

    setFilter: (key, value) => {
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value,
                page: key === "page" ? value : 1,
            },
        }));
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
        });
    },

    fetchLocations: async (type, force = false) => {
        try {
            const { filters, hasFetched } = get();

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
            }));
        } catch (error) {
            set({
                error: error.message,
            });
        } finally {
            set({ loading: false });
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

            await get().fetchLocations(type);

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

            await get().fetchLocations(type);

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

            await get().fetchLocations(type);

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