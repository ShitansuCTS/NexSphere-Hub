"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useLocationStore } from "@/store/useLocationStore";

const ProductInfoOne = () => {
  const { booths, loading, fetchLocations } = useLocationStore();

  useEffect(() => {
    fetchLocations("booths");
  }, [fetchLocations]);

  if (loading) {
    return <p>Loading booths...</p>;
  }

  return (
    <div className="card h-100 rounded-4 overflow-hidden">
      <div className="card-body p-20">
        <div className="row g-3">
          {booths.map((booths) => (
            <div className="col-xl-3 col-sm-6" key={booths.id}>
              <div className="px-24 py-16 rounded-3 border border-neutral-200 sales-card-gradient-bg-1">
                <div className="d-flex justify-content-between align-items-center gap-12">
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold mb-0">{booths.name}</h6>

                    <span className="text-secondary-light mt-1">booths</span>
                  </div>

                  <span>
                    <Link
                      href={`/location/booths/${booths.id}`}
                      className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="iconamoon:eye-light" />
                    </Link>

                    <Link
                      href={`/location/booths/edit/${booths.id}`}
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </Link>
                  </span>
                </div>

                <p className="text-sm mb-0 mt-20">
                  <span className="bg-base shadow-10 px-8 py-2 rounded-2 fw-medium text-success-main text-sm d-inline-flex align-items-center gap-1 me-6">
                    <i className="ri-map-pin-line" />
                    Active
                  </span>
                  Created booths
                </p>
              </div>
            </div>
          ))}

          {booths.length === 0 && (
            <div className="col-12">
              <p className="mb-0 text-secondary-light">No booths found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfoOne;
