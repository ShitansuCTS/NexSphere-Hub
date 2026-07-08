import {
    previewContactImportService,
    confirmContactImportService,
} from "@/services/contacts/contact-import.service";


export const previewContactImportController = async (formData) => {
    const result =
        await previewContactImportService(formData);

    return {
        status: 200,
        data: {
            success: true,
            message: "Contact import preview generated successfully",
            data: result,
        },
    };
};


export const confirmContactImportController = async (
    body
) => {
    const result =
        await confirmContactImportService(body);

    return {
        status: 201,
        data: {
            success: true,
            message:
                "Contacts imported successfully",
            data: result,
        },
    };
};