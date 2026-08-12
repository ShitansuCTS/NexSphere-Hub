"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocationStore } from "@/store/useLocationStore";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Offcanvas from "@/components/sidebar/offcanvas";
import CreateGp from "@/components/location/gps/forms/CreateGp";
import UpdateGp from "@/components/location/gps/forms/UpdateGp";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import toast from "react-hot-toast";

const ProductInfoOne = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingGpId, setEditingGpId] = useState(null);
  const [search, setSearch] = useState("");

  const {
    gps,
    loading,
    error,
    fetchLocations,
    initListView,
    pagination,
    filters,
    setFilter,
    deleteLocation,
    hasFetched,
  } = useLocationStore();

  const start =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  const pageNumbers = useMemo(
    () => Array.from({ length: Math.max(1, pagination.totalPages) }, (_, i) => i + 1),
    [pagination.totalPages],
  );

  const hasVisibleData = gps.length > 0 || hasFetched.gps;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter("search", search, "gps");
    }, 500);

    return () => clearTimeout(timer);
  }, [search, setFilter]);

  useEffect(() => {
    initListView("gps");
  }, [initListView]);

  useEffect(() => {
    fetchLocations("gps", true);
  }, [fetchLocations, filters.page, filters.limit, filters.search]);

  const handleEditClick = useCallback((gpId) => {
    setEditingGpId(gpId);
    setTimeout(() => {
      setShowEdit(true);
    }, 50);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreate(false);
    fetchLocations("gps", true);
  }, [fetchLocations]);

  const handleEditSuccess = useCallback(() => {
    setShowEdit(false);
    setTimeout(() => {
      setEditingGpId(null);
    }, 300);
    fetchLocations("gps", true);
  }, [fetchLocations]);

  const handleRetry = useCallback(() => {
    fetchLocations("gps", true);
  }, [fetchLocations]);

  const handleDelete = useCallback(
    async (gpId, gpName) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${gpName}?`
      );

      if (!confirmed) return;

      try {
        const response = await deleteLocation("gps", gpId);

        if (response?.success) {
          toast.success(
            response.message || "GP deleted successfully"
          );

          await fetchLocations("gps", true);
        } else {
          toast.error(
            response?.message || "Failed to delete GP"
          );
        }
      } catch (error) {
        console.error("DELETE ERROR:", error);
        toast.error("Failed to delete GP");
      }
    },
    [deleteLocation, fetchLocations]
  );

  if (loading && !hasVisibleData) {
    return (
      <div className="row g-3">
        {Array.from({ length: filters.limit }).map((_, index) => (
          <div className="col-xl-3 col-sm-6" key={index}>
            <div className="card p-3">
              <SkeletonLoader height={24} width="70%" />

              <SkeletonLoader height={16} width="40%" className="mt-2" />

              <SkeletonLoader height={40} className="mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger-subtle p-4 text-center">
        <h6 className="mb-2">Unable to load GPs</h6>
        <p className="text-secondary-light mb-3">{error}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card shadow-sm mb-3 p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control bg-base"
                  placeholder="Search GPS entries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search GPS entries"
                />
                {search ? (
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-2"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <Icon icon="mdi:close" className="text-secondary-light" />
                  </button>
                ) : (
                  <Icon icon="ion:search-outline" className="icon" />
                )}
              </div>
            </form>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div>
              <select
                className="form-select form-select-sm w-auto radius-12"
                value={filters.limit}
                onChange={(e) => setFilter("limit", Number(e.target.value), "gps")}
                aria-label="Select page size"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
                <option value={64}>64</option>
              </select>
            </div>

            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={() => setShowCreate(true)}
              disabled={loading}
              type="button"
            >
              <Icon icon="ic:baseline-plus" />
              Add GP
            </button>
          </div>
        </div>
      </div>

      <Offcanvas
        show={showCreate}
        title="Create GP"
        subtitle="Provide GP information."
        onClose={() => setShowCreate(false)}
      >
        <CreateGp onSuccess={handleCreateSuccess} />
      </Offcanvas>

      <Offcanvas
        show={showEdit}
        title="Update GP"
        subtitle="Modify the GP details."
        onClose={() => {
          setShowEdit(false);
          setTimeout(() => setEditingGpId(null), 300);
        }}
      >
        {editingGpId && (
          <UpdateGp gpId={editingGpId} onSuccess={handleEditSuccess} />
        )}
      </Offcanvas>

      {/* GPS Grid */}
      <div className="card h-100 rounded-4 overflow-hidden">
        <div className="card-body p-20">
          <div className="row row-cols-xxl-4 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 gy-4">
            {gps.map((gp) => (
              <div className="col" key={gp.id}>
                <div className="card shadow-none border h-100 px-2 py-2 rounded-3 border border-neutral-200 sales-card-gradient-bg-1">
                  <div className="card-body p-20 d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex align-items-center gap-3 mb-20">
                      <div className="w-48-px h-48-px rounded-circle bg-primary-50 text-primary d-flex align-items-center justify-content-center flex-shrink-0">
                        <Icon
                          icon="mdi:map-marker-radius-outline"
                          className="text-xl"
                        />
                      </div>

                      <div className="flex-grow-1 min-w-0">
                        <h6 className="mb-0 fw-semibold text-truncate">
                          {gp.name}
                        </h6>

                        <span className="text-secondary-light small">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Push actions to bottom */}
                    <div className="mt-auto pt-16 border-top">
                      <div className="d-flex align-items-center justify-content-between">
                        <small className="text-secondary-light d-flex align-items-center gap-1">
                          <Icon
                            icon="solar:calendar-outline"
                            className="text-sm"
                          />
                          {new Date(gp.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </small>
                        <div className="d-flex align-items-center gap-2">
                          {/* <Link
                            href={`/location/gps/${gp.id}`}
                            className="bg-info-focus text-info-600 bg-hover-info-200 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="View"
                          >
                            <Icon icon="lucide:eye" />
                          </Link> */}

                          <button
                            type="button"
                            onClick={() => handleEditClick(gp.id)}
                            className="bg-success-focus text-success-600 bg-hover-success-200 border-0 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="Edit"
                            aria-label={`Edit ${gp.name}`}
                          >
                            <Icon icon="lucide:edit" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(gp.id, gp.name)}
                            className="bg-danger-focus text-danger-600 bg-hover-danger-200 border-0 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="Delete"
                            aria-label={`Delete ${gp.name}`}
                          >
                            <Icon icon="fluent:delete-24-regular" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {gps.length === 0 && (
              <div className="col-12">
                <div className="card border text-center py-5">
                  <Icon
                    icon="mdi:map-outline"
                    className="text-secondary-light text-4xl mb-3"
                  />
                  <h6 className="mb-1">No GPS Entries Found</h6>
                  <p className="text-secondary-light mb-0">
                    Click <strong>Add GP</strong> to create your first GP.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* pagination code */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 my-3 px-3">
          <span className="text-secondary-light">
            Showing {start} to {end} of {pagination.total} entries
          </span>

          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mb-0">
            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasPrev}
                onClick={() => setFilter("page", pagination.page - 1, "gps")}
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px bg-base"
              >
                <Icon icon="ep:d-arrow-left" className="text-xl" />
              </button>
            </li>

            {pageNumbers.map((page) => (
              <li key={page} className="page-item">
                <button
                  type="button"
                  onClick={() => setFilter("page", page, "gps")}
                  className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px ${page === pagination.page
                      ? "bg-primary-600 text-white"
                      : "bg-primary-50 text-secondary-light"
                    }`}
                >
                  {page}
                </button>
              </li>
            ))}

            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => setFilter("page", pagination.page + 1, "gps")}
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px bg-base"
              >
                <Icon icon="ep:d-arrow-right" className="text-xl" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ProductInfoOne;
