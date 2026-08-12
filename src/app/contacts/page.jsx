"use client";

import MasterLayout from "@/masterLayout/MasterLayout";
import ContactTable from "@/components/contacts/ContactTable";

export default function ContactsPage() {
  return (
    <MasterLayout>
      <div className="container-fluid">
        <div className="mb-24">
          <h4 className="fw-bold mb-1">Contacts</h4>
          <p className="text-secondary-light mb-0">
            Manage all contacts from one place.
          </p>
        </div>

        <ContactTable />
      </div>
    </MasterLayout>
  );
}
