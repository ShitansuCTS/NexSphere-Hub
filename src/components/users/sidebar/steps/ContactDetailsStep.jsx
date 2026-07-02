"use client";

import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const ContactDetailsStep = ({ form, setForm }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-3">Contact Details</h6>

        <div className="row gy-3">
          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Your Name</label>
            <div className="icon-field">
              <span className="icon">
                <Icon icon="f7:person" />
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Your Name"
              />
            </div>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Email</label>
            <div className="icon-field">
              <span className="icon">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Email"
              />
            </div>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Phone</label>
            <div className="icon-field">
              <span className="icon">
                <Icon icon="solar:phone-calling-linear" />
              </span>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Alternate Phone</label>
            <div className="icon-field">
              <span className="icon">
                <Icon icon="solar:phone-linear" />
              </span>
              <input
                type="text"
                name="alternateMobile"
                value={form.alternateMobile}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter alternate phone"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsStep;
