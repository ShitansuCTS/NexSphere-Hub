import {
  createContactService,
  updateContactService,
  deleteContactService,
  getContactService,
  getContactsService,
  bulkDeleteContactsService,
} from "@/services/contacts/contact.service";

/**
 * Create Contact
 */
export const createContact = async (req) => {
  try {
    const body = await req.json();

    const result = await createContactService(body);

    return Response.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
};

/**
 * Get All Contacts
 */
export const getContacts = async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    const result = await getContactsService({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 12,
      search: searchParams.get("search") || "",
      stateId: searchParams.get("stateId") || "",
      districtId: searchParams.get("districtId") || "",
      blockId: searchParams.get("blockId") || "",
      nacId: searchParams.get("nacId") || "",
      gpId: searchParams.get("gpId") || "",
      villageId: searchParams.get("villageId") || "",
      wardId: searchParams.get("wardId") || "",
      boothId: searchParams.get("boothId") || "",
    });

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
};

/**
 * Get Contact By Id
 */
export const getContact = async (req, context) => {
  try {
    const params = await context.params;
    const result = await getContactService(params.id);

    return Response.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 404 }
    );
  }
};

/**
 * Update Contact
 */
export const updateContact = async (req, context) => {
  try {
    const params = await context.params;
    const body = await req.json();

    const result = await updateContactService(params.id, body);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
};

/**
 * Delete Contact
 */
export const deleteContact = async (req, context) => {
  try {
    const params = await context.params;
    const result = await deleteContactService(params.id);

    return Response.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 404 }
    );
  }
};

/**
 * Bulk Delete Contacts
 */
export const bulkDeleteContacts = async (req) => {
  try {
    const body = await req.json();

    await bulkDeleteContactsService(body.ids);

    return Response.json({
      success: true,
      message: "Contacts deleted successfully.",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
};