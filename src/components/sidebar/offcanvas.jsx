"use client";

import { useEffect } from "react";
import "@/style/offcanvas.css";

export default function Offcanvas({ show, title, onClose, children }) {
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
        <div className="offcanvas-header">
          <h5 id="offcanvasTitle" className="offcanvas-title mb-0">
            {title}
          </h5>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">{children}</div>
      </div>

      {show && (
        <div className="offcanvas-backdrop fade show" onClick={onClose} />
      )}
    </>
  );
}
