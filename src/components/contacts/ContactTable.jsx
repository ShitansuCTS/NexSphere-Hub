"use client";

import { useState, useCallback, useMemo } from "react";
import { useContactStore } from "@/store/useContactStore";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Offcanvas from "@/components/sidebar/offcanvas";
import CreateContact from "@/components/contacts/forms/CreateContact";
import UpdateContact from "@/components/contacts/forms/UpdateContact";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import ContactFilters from "@/components/contacts/ContactFilters";
import toast from "react-hot-toast";

const ContactTable = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);

  const {
    contacts = [],
    loading,
    error,
    fetchContacts,
    pagination,
    filters,
    setFilters,
    deleteContact,
    hasFetched = {},
  } = useContactStore();

  const start =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  const pageNumbers = useMemo(
    () => Array.from({ length: Math.max(1, pagination.totalPages) }, (_, i) => i + 1),
    [pagination.totalPages],
  );

  const hasVisibleData = contacts.length > 0 || hasFetched.contacts;

  const handleEditClick = useCallback((contactId) => {
    setEditingContactId(contactId);
    setTimeout(() => {
      setShowEdit(true);
    }, 50);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreate(false);
    fetchContacts();
  }, [fetchContacts]);

  const handleEditSuccess = useCallback(() => {
    setShowEdit(false);
    setTimeout(() => {
      setEditingContactId(null);
    }, 300);
    fetchContacts();
  }, [fetchContacts]);

  const handleRetry = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = useCallback((contactId, contactName) => {
    let confirmToastId;

    const confirmDelete = async () => {
      toast.dismiss(confirmToastId);
      const response = await deleteContact(contactId);
      if (response.success) {
        toast.success(response.message || "Contact deleted successfully");
        fetchContacts();
      } else {
        toast.error(response.message || "Failed to delete contact");
      }
    };

    confirmToastId = toast(
      <div className="p-2">
        <h6 className="mb-2">Delete contact?</h6>
        <p className="mb-3 text-secondary-light">
          Are you sure you want to delete <strong>{contactName}</strong>?
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-sm btn-light" onClick={() => toast.dismiss(confirmToastId)}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={confirmDelete}>
            Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
      },
    );
  }, [deleteContact, fetchContacts]);

  if (loading && !hasVisibleData) {
    return (
      <div className="row g-3">
        {Array.from({ length: filters.limit }).map((_, index) => (
          <div className="col-xl-3 col-sm-6" key={index}>
            <div className="card p-3">
              <SkeletonLoader height={24} width="70%" />

              <SkeletonLoader height={16} width="40%" className="mt-2" />

              <SkeletonLoader height={40} className="mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger-subtle p-4 text-center">
        <h6 className="mb-2">Unable to load contacts</h6>
        <p className="text-secondary-light mb-3">{error}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <ContactFilters />

      <div className="card h-100 p-0 radius-12 mb-4">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <span className="text-md fw-medium text-secondary-light mb-0">Show</span>
            <select
              className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
              value={filters.limit}
              onChange={(e) => setFilters({ limit: Number(e.target.value), page: 1 })}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={64}>64</option>
            </select>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link
              href="/contacts/import"
              className="btn btn-outline-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
            >
              <Icon icon="mdi:upload" className="icon text-xl line-height-1" />
              Import
            </Link>
            <button
              type="button"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
              Add New Contact
            </button>
          </div>
        </div>
      </div>

      <Offcanvas
        show={showCreate}
        title="Create Contact"
        subtitle="Provide contact information."
        onClose={() => setShowCreate(false)}
      >
        <CreateContact onSuccess={handleCreateSuccess} />
      </Offcanvas>

      <Offcanvas
        show={showEdit}
        title="Update Contact"
        subtitle="Modify the contact details."
        onClose={() => {
          setShowEdit(false);
          setTimeout(() => setEditingContactId(null), 300);
        }}
      >
        {editingContactId && (
          <UpdateContact contactId={editingContactId} onSuccess={handleEditSuccess} />
        )}
      </Offcanvas>

      {/* Contacts Grid */}
      <div className="card h-100 rounded-4 overflow-hidden">
        <div className="card-body p-20">
          <div className="row row-cols-xxl-3 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 gy-4">
            {contacts.map((contact, index) => {
              const imageIndex = (index % 12) + 1;
              const bgImage = `https://t3.ftcdn.net/jpg/03/51/32/12/360_F_351321223_YZzIv6IPGGRcSFm0TErJcS82L5ndpbrD.jpg`;
              const firstLetter = contact?.name?.charAt(0)?.toUpperCase() || "U";
              
              const avatarImage = contact.profilePicture || `https://placehold.co/40x40/000000/FFFFFF/png?text=${encodeURIComponent(firstLetter)}`;

              return (
                <div className="col-xxl-3 col-md-6 user-grid-card" key={contact.id}>
                  <div className="position-relative border radius-16 overflow-hidden">
                    <img src={bgImage} alt="Contact background" className="w-100 object-fit-cover" style={{ height: "80px" }} />
                    <div className="dropdown position-absolute top-0 end-0 me-16 mt-16">
                      <button
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        className="bg-white-gradient-light w-32-px h-32-px radius-8 border border-light-white d-flex justify-content-center align-items-center text-white"
                      >
                        <Icon icon="entypo:dots-three-vertical" className="icon" />
                      </button>
                      <ul className="dropdown-menu p-12 border bg-base shadow">
                        <li>
                          <button
                            type="button"
                            onClick={() => handleEditClick(contact.id)}
                            className="dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-10 w-100"
                          >
                            Edit
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id, contact.name)}
                            className="delete-btn dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-danger-100 text-hover-danger-600 d-flex align-items-center gap-10 w-100"
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div className="ps-16 pb-16 pe-16 text-center mt--50">
                      <img
                        src={avatarImage}
                        alt="Contact avatar"
                        className="border br-white border-width-2-px w-100-px h-100-px rounded-circle object-fit-cover"
                      />
                      <h6 className="text-lg mb-0 mt-4">{contact.name}</h6>
                      <span className="text-secondary-light mb-16">{contact.email || "No email"}</span>
                      <div className="center-border position-relative bg-danger-gradient-light radius-8 p-12 d-flex align-items-center gap-4">
                        <div className="text-center w-50">
  <p className="text-sm fw-bold mb-0">
    {contact.designation || "Contact"}
  </p>
  <span className="text-secondary-light text-xs mb-0">
    Designation
  </span>
</div>

<div className="text-center w-50">
  <p className="text-sm fw-bold mb-0">
    {contact.booth?.name || "N/A"}
  </p>
  <span className="text-secondary-light text-xs mb-0">
    Booth
  </span>
</div>
                      </div>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="bg-primary-50 text-primary-600 bg-hover-primary-600 hover-text-white p-10 text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center justify-content-center mt-16 fw-medium gap-2 w-100"
                      >
                        View Profile
                        <Icon icon="solar:alt-arrow-right-linear" className="icon text-xl line-height-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {contacts.length === 0 && (
              <div className="col-12">
                <div className="card border text-center py-5">
                  <Icon
                    icon="mdi:account-outline"
                    className="text-secondary-light text-4xl mb-3"
                  />
                  <h6 className="mb-1">No Contacts Found</h6>
                  <p className="text-secondary-light mb-0">
                    Click <strong>Add Contact</strong> to create your first contact.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* pagination code */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 my-3 px-3">
          <span className="text-secondary-light">
            Showing {start} to {end} of {pagination.total} entries
          </span>

          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mb-0">
            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasPrev}
                onClick={() => setFilters({ page: pagination.page - 1 })}
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px bg-base"
              >
                <Icon icon="ep:d-arrow-left" className="text-xl" />
              </button>
            </li>

            {pageNumbers.map((page) => (
              <li key={page} className="page-item">
                <button
                  type="button"
                  onClick={() => setFilters({ page: page })}
                  className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px ${
                    page === pagination.page
                      ? "bg-primary-600 text-white"
                      : "bg-primary-50 text-secondary-light"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}

            <li className="page-item">
              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => setFilters({ page: pagination.page + 1 })}
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px me-8 w-32-px bg-base"
              >
                <Icon icon="ep:d-arrow-right" className="text-xl" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ContactTable;