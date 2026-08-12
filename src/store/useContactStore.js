import { create } from "zustand";

const CONTACTS_API = "/api/v1/contacts";

const buildQuery = (filters) => {
  const query = new URLSearchParams();

  if (filters.page) query.set("page", filters.page);
  if (filters.limit) query.set("limit", filters.limit);
  if (filters.search) query.set("search", filters.search);
  if (filters.stateId) query.set("stateId", filters.stateId);
  if (filters.districtId) query.set("districtId", filters.districtId);
  if (filters.blockId) query.set("blockId", filters.blockId);
  if (filters.nacId) query.set("nacId", filters.nacId);
  if (filters.gpId) query.set("gpId", filters.gpId);
  if (filters.villageId) query.set("villageId", filters.villageId);
  if (filters.wardId) query.set("wardId", filters.wardId);
  if (filters.boothId) query.set("boothId", filters.boothId);

  return query.toString();
};

export const useContactStore = create((set, get) => ({
  // -----------------------
  // State
  // -----------------------

  contacts: [],

  loading: false,

  actionLoading: false,

  hasFetched: {
    contacts: false,
  },

  filters: {
    page: 1,
    limit: 12,
    search: "",
    areaType: "",
    stateId: "",
    districtId: "",
    blockId: "",
    nacId: "",
    gpId: "",
    villageId: "",
    wardId: "",
    boothId: "",
  },

  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },

  error: null,

  // -----------------------
  // Filters
  // -----------------------

  setFilters: (data) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...data,
      },
      hasFetched: {
        ...state.hasFetched,
        contacts: false,
      },
    })),

  resetFilters: () =>
    set({
      filters: {
        page: 1,
        limit: 12,
        search: "",
        areaType: "",
        stateId: "",
        districtId: "",
        blockId: "",
        nacId: "",
        gpId: "",
        villageId: "",
        wardId: "",
        boothId: "",
      },
      hasFetched: {
        contacts: false,
      },
    }),

  // -----------------------
  // Fetch Contacts
  // -----------------------

  fetchContacts: async () => {
    set({ loading: true, error: null });

    try {
      const { filters } = get();
      const query = buildQuery(filters);
      const url = `${CONTACTS_API}${query ? `?${query}` : ""}`;

      const res = await fetch(url, {
        method: "GET",
      });

      const response = await res.json();

      if (!res.ok || !response.success) {
        throw new Error(response.message || "Failed to load contacts");
      }

      set({
        contacts: response.data || response.contacts || [],
        pagination: {
          total: response.total ?? response.pagination?.total ?? 0,
          page: response.page ?? response.pagination?.page ?? filters.page,
          limit: response.limit ?? response.pagination?.limit ?? filters.limit,
          totalPages: response.totalPages ?? response.pagination?.totalPages ?? 1,
          hasNext:
            (response.page ?? filters.page) <
            (response.totalPages ?? 1),
          hasPrev: (response.page ?? filters.page) > 1,
        },
        hasFetched: {
          ...get().hasFetched,
          contacts: true,
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      set({ error: error.message || "Failed to load contacts" });

      return {
        success: false,
        message: error.message || "Failed to load contacts",
      };
    } finally {
      set({ loading: false });
    }
  },

  // -----------------------
  // Get by ID
  // -----------------------

  getContactById: async (id) => {
    set({ loading: true });

    try {
      const res = await fetch(`${CONTACTS_API}/${id}`, {
        method: "GET",
      });

      const response = await res.json();
      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Failed to load contact",
      };
    } finally {
      set({ loading: false });
    }
  },

  // -----------------------
  // Create
  // -----------------------

  createContact: async (payload) => {
    set({ actionLoading: true });

    try {
      const res = await fetch(CONTACTS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (response.success) {
        await get().fetchContacts();
      }

      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Failed to create contact",
      };
    } finally {
      set({ actionLoading: false });
    }
  },

  // -----------------------
  // Update
  // -----------------------

  updateContact: async (id, payload) => {
    set({ actionLoading: true });

    try {
      const res = await fetch(`${CONTACTS_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (response.success) {
        await get().fetchContacts();
      }

      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Failed to update contact",
      };
    } finally {
      set({ actionLoading: false });
    }
  },

  // -----------------------
  // Delete
  // -----------------------

  deleteContact: async (id) => {
    set({ actionLoading: true });

    try {
      const res = await fetch(`${CONTACTS_API}/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();

      if (response.success) {
        await get().fetchContacts();
      }

      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Failed to delete contact",
      };
    } finally {
      set({ actionLoading: false });
    }
  },
}));