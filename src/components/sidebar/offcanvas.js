"use client";

import { useEffect } from "react";
import "@/style/offcanvas.css";
import { Icon } from "@iconify/react";
export default function Offcanvas({
    show,
    title,
    subtitle,
    onClose,
    children,
}) {
    useEffect(() => {
        if (show) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.classList.remove("overflow-hidden");
            document.removeEventListener("keydown", handleEscape);
        };
    }, [show, onClose]);

    return (
        <>
            <div
                className={`offcanvas offcanvas-end custom-offcanvas ${show ? "show" : ""}`}
                tabIndex="-1"
                aria-labelledby="offcanvasTitle"
                aria-hidden={!show}
                style={{
                    visibility: show ? "visible" : "hidden",
                    display: "block",
                }}
            >
                <div className="offcanvas-header justify-content-between custom-offcanvas-header">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary" style={{ width: 42, height: 42 }}>
                                <Icon icon="mdi:map-marker-radius-outline" className="fs-5" />
                            </div>
                            <div>
                                <p id="offcanvasTitle" className="h6 fw-bold mb-0">{title}</p>
                                {subtitle ? (
                                    <small className="text-muted d-block">{subtitle}</small>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="bg-danger-focus text-danger-600 bg-hover-danger-200 border-0 w-36-px h-36-px rounded-circle d-flex align-items-center justify-content-center offcanvas-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <Icon icon="mdi:close" className="fs-5" />
                    </button>
                </div>

                <div className="offcanvas-body custom-offcanvas-body">
                    {children}
                </div>
            </div>

            {show && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={onClose}
                />
            )}
        </>
    );
}