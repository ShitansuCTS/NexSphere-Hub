// src/components/loader/ProfileDetailsSkeleton.jsx

import React from "react";
import SkeletonLoader from "./SkeletonLoader";

const ProfileDetailsSkeleton = () => {
  return (
    <div className="card h-100">
      <div className="card-body p-24">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-20">
          <div>
            <SkeletonLoader height={28} width={200} className="mb-2" />
            <SkeletonLoader height={16} width={300} />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <SkeletonLoader height={40} width={80} className="radius-8" />
            <SkeletonLoader height={40} width={80} className="radius-8" />
          </div>
        </div>

        <div className="mb-20">
          <SkeletonLoader height={40} width={200} />
        </div>

        <div className="tab-content">
          <div className="row gy-3">
            {[...Array(8)].map((_, index) => (
              <div className="col-sm-6" key={index}>
                <div>
                  <SkeletonLoader height={16} width="40%" className="mb-2" />
                  <SkeletonLoader height={20} width="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsSkeleton;