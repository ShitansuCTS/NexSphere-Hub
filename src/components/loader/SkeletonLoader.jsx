"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonLoader({
    count = 1,
    height = 20,
    width = "100%",
    circle = false,
    className = "",
    containerClassName = "",
}) {
    const isDark =
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") === "dark";

    return (
        <SkeletonTheme
            baseColor={isDark ? "#2d3748" : "#e9ecef"}
            highlightColor={isDark ? "#4a5568" : "#f8f9fa"}
        >
            <Skeleton
                count={count}
                height={height}
                width={width}
                circle={circle}
                className={className}
                containerClassName={containerClassName}
            />
        </SkeletonTheme>
    );
}