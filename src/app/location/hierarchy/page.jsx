import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import LocationHierarchy from "@/components/location/hierarchy/LocationHierarchy";
import SkeletonLoader from "@/components/loader/SkeletonLoader";

export const metadata = {
  title: "Location Hierarchy | NexSphere Hub",
  description: "Browse and navigate the location hierarchy from state to booth.",
};

const HierarchyFallback = () => (
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

const Page = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Location Hierarchy" />
      <Suspense fallback={<HierarchyFallback />}>
        <LocationHierarchy />
      </Suspense>
    </MasterLayout>
  );
};

export default Page;
