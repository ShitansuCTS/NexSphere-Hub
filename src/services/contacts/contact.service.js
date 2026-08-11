import {
  createContactStore,
  updateContactStore,
  deleteContactStore,
  getContactByIdStore,
  getContactByMobileStore,
  getContactsStore,
  bulkDeleteContactsStore,
  updateContactProfilePictureStore,
} from "@/store/contacts/contact.store";

import {
  validateCreateContact,
  validateUpdateContact,
} from "@/validations/contacts.validation";

/**
 * Create Contact
 */
export async function createContactService(payload) {
  const validation = validateCreateContact(payload);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const exists = await getContactByMobileStore(validation.data.mobile);

  if (exists) {
    return {
      success: false,
      message: "Mobile number already exists.",
    };
  }

  const contact = await createContactStore(validation.data);

  return {
    success: true,
    message: "Contact created successfully.",
    data: contact,
  };
}

/**
 * Update Contact
 */
export async function updateContactService(id, payload) {
  const contact = await getContactByIdStore(id);

  if (!contact) {
    return {
      success: false,
      message: "Contact not found.",
    };
  }

  const validation = validateUpdateContact(payload);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  if (validation.data.mobile) {
    const exists = await getContactByMobileStore(validation.data.mobile);

    if (exists && exists.id !== id) {
      return {
        success: false,
        message: "Mobile number already exists.",
      };
    }
  }

  const updatedContact = await updateContactStore(id, validation.data);

  return {
    success: true,
    message: "Contact updated successfully.",
    data: updatedContact,
  };
}

/**
 * Update Contact Profile Picture
 */
export async function updateContactProfilePictureService(id, profilePictureUrl) {
  const contact = await getContactByIdStore(id);

  if (!contact) {
    return {
      success: false,
      message: "Contact not found.",
    };
  }

  const updatedContact = await updateContactProfilePictureStore(id, profilePictureUrl);

  return {
    success: true,
    message: "Profile picture updated successfully.",
    data: updatedContact,
  };
}

/**
 * Delete Contact
 */
export async function deleteContactService(id) {
  const contact = await getContactByIdStore(id);

  if (!contact) {
    return {
      success: false,
      message: "Contact not found.",
    };
  }

  await deleteContactStore(id);

  return {
    success: true,
    message: "Contact deleted successfully.",
  };
}

/**
 * Get Single Contact
 */
export async function getContactService(id) {
  const contact = await getContactByIdStore(id);

  if (!contact) {
    return {
      success: false,
      message: "Contact not found.",
    };
  }

  return {
    success: true,
    message: "Contact fetched successfully.",
    data: contact,
  };
}

/**
 * Get Contacts
 */
export async function getContactsService(query = {}) {
  const {
    page = 1,
    limit = 12,
    search = "",

    stateId,
    districtId,
    blockId,
    nacId,
    gpId,
    villageId,
    wardId,
    boothId,
  } = query;

  const pagination = await getContactsStore({
    page: Number(page),
    limit: Number(limit),
    search,

    stateId,
    districtId,
    blockId,
    nacId,
    gpId,
    villageId,
    wardId,
    boothId,
  });

  return {
    success: true,
    ...pagination,
  };
}

/**
 * Bulk Delete Contacts
 */
export async function bulkDeleteContactsService(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      message: "Please select at least one contact.",
    };
  }

  await bulkDeleteContactsStore(ids);

  return {
    success: true,
    message: "Contacts deleted successfully.",
  };
}