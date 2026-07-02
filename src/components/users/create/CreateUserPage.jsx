"use client";
import React, { useState } from "react";
import Link from "next/link";
import AddUserSidebar from "../sidebar/AddUserSidebar";

const CreateUserPage = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  return (
    <>
      <div className="card">
        <div className="card-header d-flex flex-wrap align-items-center justify-content-center gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddUser(true)}
              className="btn btn-sm btn-primary-600"
            >
              <i className="ri-add-line" /> Add User
            </button>
            <Link
              href="invoice-add.html"
              className="btn btn-sm btn-success-600"
            >
              <i className="ri-add-line" /> Excel Import
            </Link>
          </div>
        </div>
      </div>

      <AddUserSidebar
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
      />
    </>
  );
};

export default CreateUserPage;
