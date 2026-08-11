// src/components/loader/ContactProfileSkeleton.jsx

import React from "react";
import SkeletonLoader from "./SkeletonLoader";

const ContactProfileSkeleton = () => {
  return (
    <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
      <SkeletonLoader height={150} className="w-100 object-fit-cover" />
      <div className="pb-24 ms-16 mb-24 me-16 mt--100">
        <div className="text-center border border-top-0 border-start-0 border-end-0">
          <div className="mb-24 mt-16">
            <div className="avatar-upload mx-auto">
              <div className="avatar-preview">
                <SkeletonLoader
                  height={150}
                  width={150}
                  className="rounded-circle"
                />
              </div>
            </div>
          </div>
          <SkeletonLoader height={24} width="50%" className="mb-2" />
          <SkeletonLoader height={16} width="70%" className="mb-2" />
          <SkeletonLoader height={16} width="60%" />
        </div>
      </div>
    </div>
  );
};

export default ContactProfileSkeleton;