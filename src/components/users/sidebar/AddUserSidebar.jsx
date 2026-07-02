"use client";

import React, { useState } from "react";
import ContactDetailsStep from "@/components/users/sidebar/steps/ContactDetailsStep";
import LocationDetailsStep from "@/components/users/sidebar/steps/LocationDetailsStep";

const AddUserSidebar = ({ show, onClose }) => {
  const [step, setStep] = useState(1);

  const [locationForm, setLocationForm] = useState({
    stateId: "",
    districtId: "",
    mode: "",
    blockId: "",
    nacId: "",
    gpId: "",
    villageId: "",
    wardId: "",
    boothId: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    designation: "",
    address: "",
  });

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: contactForm.name,
        mobile: contactForm.mobile,
        alternateMobile: contactForm.alternateMobile,
        email: contactForm.email,
        designation: contactForm.designation,
        address: contactForm.address,

        nacId: locationForm.nacId || "",
        blockId: locationForm.blockId || "",
        gpId: locationForm.gpId || "",
        villageId: locationForm.villageId || "",
        wardId: locationForm.wardId || "",
        boothId: locationForm.boothId || "",
      };

      const res = await fetch("/api/v1/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to create contact");
        return;
      }

      alert("Contact created successfully");

      onClose();
    } catch (error) {
      console.error("CREATE CONTACT ERROR:", error);
      alert("Something went wrong");
    }
  };
  return (
    <>
      <div
        className={`offcanvas-backdrop fade ${show ? "show" : ""}`}
        style={{ display: show ? "block" : "none" }}
        onClick={handleClose}
      />

      <div
        className={`offcanvas offcanvas-end ${show ? "show" : ""}`}
        tabIndex="-1"
        style={{
          visibility: show ? "visible" : "hidden",
          width: "500px",
        }}
      >
        <div className="offcanvas-header border-bottom">
          <div>
            <h5 className="offcanvas-title mb-1">Add New Contact</h5>
            <p className="text-muted mb-0 small">Step {step} of 2</p>
          </div>

          <button type="button" className="btn-close" onClick={handleClose} />
        </div>

        <div className="offcanvas-body">
          {step === 1 && (
            <LocationDetailsStep
              form={locationForm}
              setForm={setLocationForm}
            />
          )}
          {step === 2 && (
            <ContactDetailsStep form={contactForm} setForm={setContactForm} />
          )}
        </div>

        <div className="border-top p-3 d-flex justify-content-between gap-2">
          <button className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>

          <div className="d-flex gap-2">
            {step > 1 && (
              <button
                className="btn btn-neutral-300"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </button>
            )}

            {step < 2 ? (
              <button
                className="btn btn-primary-600"
                onClick={() => setStep(step + 1)}
              >
                Next
              </button>
            ) : (
              <button className="btn btn-success-600" onClick={handleSubmit}>
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserSidebar;
