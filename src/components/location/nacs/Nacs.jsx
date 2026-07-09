"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/useLocationStore";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Offcanvas from "@/components/sidebar/offcanvas";
import StateForm from "@/components/location/nacs/forms/CreateNac";
import SkeletonLoader from "@/components/loader/SkeletonLoader";

const ProductInfoOne = () => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");

  const { nacs, loading, fetchLocations, pagination, filters, setFilter } =
    useLocationStore();
  const start =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter("search", search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, setFilter]);
  useEffect(() => {
    fetchLocations("nacs", true);
  }, [filters, fetchLocations]);

  if (loading) {
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

  return (
    <>
      <div className="card shadow-sm mb-3 p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <form
              className="navbar-search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                className="form-control bg-base"
                placeholder="Search nacs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Icon icon="ion:search-outline" className="icon" />
            </form>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div>
              <select
                className="form-select form-select-sm w-auto radius-12"
                value={filters.limit}
                onChange={(e) => setFilter("limit", Number(e.target.value))}
              >
                <option value={8}>8</option>
                <option value={12}>24</option>
                <option value={16}>40</option>
                <option value={16}>64</option>
              </select>
            </div>

            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={() => setShow(true)}
            >
              <Icon icon="ic:baseline-plus" />
              Add nac
            </button>
          </div>
        </div>
      </div>

      <Offcanvas
        show={show}
        title="Create nac"
        onClose={() => setShow(false)}
      >
        <StateForm onSuccess={() => setShow(false)} />
      </Offcanvas>

      {/* Your table goes here */}
      <div className="card h-100 rounded-4 overflow-hidden">
        <div className="card-body p-20">
          <div className="row row-cols-xxl-4 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 gy-4">
            {nacs.map((nac) => (
              <div className="col" key={nac.id}>
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
                          {nac.name}
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
                          {new Date(nac.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </small>
                        <div className="d-flex align-items-center gap-2">
                          <Link
                            href={`/location/nacs/${nac.id}`}
                            className="bg-info-focus text-info-600 bg-hover-info-200 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="View"
                          >
                            <Icon icon="lucide:eye" />
                          </Link>

                          <Link
                            href={`/location/nacs/edit/${nac.id}`}
                            className="bg-success-focus text-success-600 bg-hover-success-200 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="Edit"
                          >
                            <Icon icon="lucide:edit" />
                          </Link>

                          <button
                            type="button"
                            className="bg-danger-focus text-danger-600 bg-hover-danger-200 border-0 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center"
                            title="Delete"
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

            {nacs.length === 0 && (
              <div className="col-12">
                <div className="card border text-center py-5">
                  <Icon
                    icon="mdi:map-outline"
                    className="text-secondary-light text-4xl mb-3"
                  />
                  <h6 className="mb-1">No nacs Found</h6>
                  <p className="text-secondary-light mb-0">
                    Click <strong>Add nac</strong> to create your first nac.
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
            {/* Previous */}

            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasPrev}
                onClick={() => setFilter("page", pagination.page - 1)}
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px bg-base"
              >
                <Icon icon="ep:d-arrow-left" className="text-xl" />
              </button>
            </li>

            {/* Page Numbers */}

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <li key={page} className="page-item">
                  <button
                    type="button"
                    onClick={() => setFilter("page", page)}
                    className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px ${
                      page === pagination.page
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-secondary-light"
                    }`}
                  >
                    {page}
                  </button>
                </li>
              ),
            )}

            {/* Next */}

            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => setFilter("page", pagination.page + 1)}
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
