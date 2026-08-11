"use client";

import { useEffect } from "react";

import MasterLayout from "@/masterLayout/MasterLayout";
import ContactTable from "@/components/contacts/ContactTable";

import { useContactStore } from "@/store/useContactStore";

export default function ContactsPage() {
  const {
    contacts,
    pagination,
    filters,
    loading,
    fetchContacts,
    setFilters,
  } = useContactStore();

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <MasterLayout>
      <div className="container-fluid">

        {/* Page Header */}
        <div className="mb-24">
          <h4 className="fw-bold mb-1">Contacts</h4>
          <p className="text-secondary-light mb-0">
            Manage all contacts from one place.
          </p>
        </div>

        {/* Filters */}
        {/* <ContactFilters /> */}

        {/* Contact List */}
        <ContactTable
          contacts={contacts}
          loading={loading}
          pagination={pagination}
          filters={filters}
          onPageChange={(page) => {
            setFilters({ page });
            fetchContacts();
          }}
        />

      </div>
    </MasterLayout>
  );
}