import {
    createContactService,
    deleteContactService,
    getContactByIdService,
    getContactsService,
    updateContactService,
} from "@/services/contacts/contact.service";

import {
    createContactSchema,
    updateContactSchema,
} from "@/validations/contact.validation";

export const createContactController = async (body) => {
    const validatedData =
        createContactSchema.parse(body);

    const contact =
        await createContactService(validatedData);

    return {
        status: 201,
        data: {
            success: true,
            message: "Contact created successfully",
            data: contact,
        },
    };
};

export const getContactsController = async (
    query
) => {
    const result =
        await getContactsService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "Contacts fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getContactByIdController = async (
    id
) => {
    const contact =
        await getContactByIdService(id);

    return {
        status: 200,
        data: {
            success: true,
            message: "Contact fetched successfully",
            data: contact,
        },
    };
};

export const updateContactController = async (
    id,
    body
) => {
    const validatedData =
        updateContactSchema.parse(body);

    const contact =
        await updateContactService(
            id,
            validatedData
        );

    return {
        status: 200,
        data: {
            success: true,
            message: "Contact updated successfully",
            data: contact,
        },
    };
};

export const deleteContactController = async (
    id
) => {
    await deleteContactService(id);

    return {
        status: 200,
        data: {
            success: true,
            message: "Contact deleted successfully",
        },
    };
};