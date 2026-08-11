"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useContactStore } from "@/store/useContactStore";
import { useLocationStore } from "@/store/useLocationStore";
import { Icon } from "@iconify/react";

export default function UpdateContact({ contactId, onSuccess }) {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [alternateMobile, setAlternateMobile] = useState("");
    const [email, setEmail] = useState("");
    const [designation, setDesignation] = useState("");
    const [address, setAddress] = useState("");
    const [stateId, setStateId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [blockId, setBlockId] = useState("");
    const [nacId, setNacId] = useState("");
    const [gpId, setGpId] = useState("");
    const [villageId, setVillageId] = useState("");
    const [wardId, setWardId] = useState("");
    const [boothId, setBoothId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");

    const {
        getContactById,
        updateContact,
        fetchContacts,
        actionLoading,
    } = useContactStore();

    const {
        states,
        districts,
        blocks,
        nacs,
        gps,
        villages,
        wards,
        booths,
        fetchLocations,
        hasFetched,
    } = useLocationStore();

    // Fetch location data
    useEffect(() => {
        if (!hasFetched.states) {
            fetchLocations("states", true);
        }
    }, [fetchLocations, hasFetched.states]);

    // Fetch districts when state changes
    useEffect(() => {
        if (stateId) {
            fetchLocations("districts", true, stateId);
        }
    }, [stateId, fetchLocations]);

    // Fetch blocks when district changes
    useEffect(() => {
        if (districtId) {
            fetchLocations("blocks", true, districtId);
        }
    }, [districtId, fetchLocations]);

    // Fetch NACs when district changes
    useEffect(() => {
        if (districtId) {
            fetchLocations("nacs", true, districtId);
        }
    }, [districtId, fetchLocations]);

    // Fetch GPs when block changes
    useEffect(() => {
        if (blockId) {
            fetchLocations("gps", true, blockId);
        }
    }, [blockId, fetchLocations]);

    // Fetch Villages when GP changes
    useEffect(() => {
        if (gpId) {
            fetchLocations("villages", true, gpId);
        }
    }, [gpId, fetchLocations]);

    // Fetch Wards when village or NAC changes
    useEffect(() => {
        if (villageId || nacId) {
            fetchLocations("wards", true, villageId || nacId);
        }
    }, [villageId, nacId, fetchLocations]);

    // Fetch Booths when ward changes
    useEffect(() => {
        if (wardId) {
            fetchLocations("booths", true, wardId);
        }
    }, [wardId, fetchLocations]);

    // Fetch contact data
    useEffect(() => {
        let isMounted = true;

        async function fetchContactData() {
            if (!contactId) {
                setIsLoading(true);
                setError(null);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getContactById(contactId);

                if (!isMounted) return;

                if (response.success && response.data) {
                    const contact = response.data;
                    setName(contact.name || "");
                    setMobile(contact.mobile || "");
                    setAlternateMobile(contact.alternateMobile || "");
                    setEmail(contact.email || "");
                    setDesignation(contact.designation || "");
                    setAddress(contact.address || "");
                    setStateId(contact.stateId || "");
                    setDistrictId(contact.districtId || "");
                    setBlockId(contact.blockId || "");
                    setNacId(contact.nacId || "");
                    setGpId(contact.gpId || "");
                    setVillageId(contact.villageId || "");
                    setWardId(contact.wardId || "");
                    setBoothId(contact.boothId || "");
                } else {
                    const errorMsg = response.message || "Failed to load contact data";
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching contact:", err);
                const errorMsg = "An error occurred while loading contact data";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchContactData();

        return () => {
            isMounted = false;
        };
    }, [contactId, getContactById]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!contactId) {
            toast.error("Contact ID is missing");
            return;
        }

        const trimmedName = name.trim();
        const trimmedMobile = mobile.trim();

        if (!trimmedName) {
            const errorMsg = "Contact name is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!trimmedMobile) {
            const errorMsg = "Mobile number is required";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        // Mobile number validation (10 digits)
        if (!/^[0-9]{10}$/.test(trimmedMobile)) {
            const errorMsg = "Please enter a valid 10-digit mobile number";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        // Email validation if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            const errorMsg = "Please enter a valid email address";
            setFieldError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setFieldError("");

        try {
            const contactData = {
                name: trimmedName,
                mobile: trimmedMobile,
                alternateMobile: alternateMobile.trim() || null,
                email: email.trim() || null,
                designation: designation.trim() || null,
                address: address.trim() || null,
                blockId: blockId || null,
                nacId: nacId || null,
                gpId: gpId || null,
                villageId: villageId || null,
                wardId: wardId || null,
                boothId: boothId || null,
            };

            const response = await updateContact(contactId, contactData);

            if (response.success) {
                toast.success(response.message || "Contact updated successfully");
                await fetchContacts("contacts", true);
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to update contact";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error updating contact:", err);
            const serverError = "An error occurred while updating the contact";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [contactId, name, mobile, alternateMobile, email, designation, address, 
        stateId, districtId, blockId, nacId, gpId, villageId, wardId, boothId, 
        updateContact, fetchContacts, onSuccess]);

    const handleRetry = useCallback(async () => {
        if (!contactId) {
            toast.error("No contact ID provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getContactById(contactId);
            if (response.success && response.data) {
                const contact = response.data;
                setName(contact.name || "");
                setMobile(contact.mobile || "");
                setAlternateMobile(contact.alternateMobile || "");
                setEmail(contact.email || "");
                setDesignation(contact.designation || "");
                setAddress(contact.address || "");
                setStateId(contact.stateId || "");
                setDistrictId(contact.districtId || "");
                setBlockId(contact.blockId || "");
                setNacId(contact.nacId || "");
                setGpId(contact.gpId || "");
                setVillageId(contact.villageId || "");
                setWardId(contact.wardId || "");
                setBoothId(contact.boothId || "");
            } else {
                setError(response.message || "Failed to load contact data");
                toast.error(response.message || "Failed to load contact data");
            }
        } catch (err) {
            console.error("Error retrying fetch:", err);
            setError("An error occurred while loading contact data");
            toast.error("An error occurred while loading contact data");
        } finally {
            setIsLoading(false);
        }
    }, [contactId, getContactById]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        onSuccess?.();
    }, [onSuccess]);

    // Reset related fields when higher-level location changes
    const handleStateChange = useCallback((value) => {
        setStateId(value || "");
        setDistrictId("");
        setBlockId("");
        setNacId("");
        setGpId("");
        setVillageId("");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleDistrictChange = useCallback((value) => {
        setDistrictId(value || "");
        setBlockId("");
        setNacId("");
        setGpId("");
        setVillageId("");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleBlockChange = useCallback((value) => {
        setBlockId(value || "");
        setGpId("");
        setVillageId("");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleNacChange = useCallback((value) => {
        setNacId(value || "");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleGpChange = useCallback((value) => {
        setGpId(value || "");
        setVillageId("");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleVillageChange = useCallback((value) => {
        setVillageId(value || "");
        setWardId("");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleWardChange = useCallback((value) => {
        setWardId(value || "");
        setBoothId("");
        if (fieldError) setFieldError("");
    }, [fieldError]);

    const handleInputChange = useCallback((setter, field) => (e) => {
        setter(e.target.value);
        if (fieldError) setFieldError("");
    }, [fieldError]);

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary-light">Loading contact data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <div className="text-danger mb-3">
                    <Icon icon="fluent:error-circle-24-regular" className="text-4xl" />
                </div>
                <h6 className="text-danger mb-2">Failed to Load Contact</h6>
                <p className="text-secondary-light mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleRetry} disabled={!contactId}>
                        <Icon icon="mdi:refresh" className="me-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!contactId) {
        return (
            <div className="text-center py-5">
                <div className="text-warning mb-3">
                    <Icon icon="mdi:alert-circle" className="text-4xl" />
                </div>
                <h6 className="text-warning mb-2">No Contact Selected</h6>
                <p className="text-secondary-light mb-4">Please select a contact to edit</p>
                <button type="button" className="btn btn-light" onClick={handleCancel}>Close</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                {/* Basic Information */}
                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-contact-name">
                        <span className="fw-semibold text-dark">* Contact Name:</span>
                    </label>
                    <input
                        id="edit-contact-name"
                        type="text"
                        className={`form-control form-control-sm ${fieldError && !name.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter contact name"
                        value={name}
                        onChange={handleInputChange(setName)}
                        disabled={actionLoading}
                        required
                        autoFocus
                    />
                    {fieldError && !name.trim() && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-mobile">
                        <span className="fw-semibold text-dark">* Mobile:</span>
                    </label>
                    <input
                        id="edit-contact-mobile"
                        type="tel"
                        className={`form-control form-control-sm ${fieldError && !mobile.trim() ? "is-invalid" : ""}`}
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={handleInputChange(setMobile)}
                        disabled={actionLoading}
                        required
                        maxLength={10}
                    />
                    {fieldError && !mobile.trim() && (
                        <div className="invalid-feedback d-block mt-2">{fieldError}</div>
                    )}
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-alt-mobile">
                        <span className="fw-semibold text-dark">Alternate Mobile:</span>
                    </label>
                    <input
                        id="edit-contact-alt-mobile"
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="Enter alternate mobile number"
                        value={alternateMobile}
                        onChange={handleInputChange(setAlternateMobile)}
                        disabled={actionLoading}
                        maxLength={10}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-email">
                        <span className="fw-semibold text-dark">Email:</span>
                    </label>
                    <input
                        id="edit-contact-email"
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="Enter email address"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        disabled={actionLoading}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-designation">
                        <span className="fw-semibold text-dark">Designation:</span>
                    </label>
                    <input
                        id="edit-contact-designation"
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter designation"
                        value={designation}
                        onChange={handleInputChange(setDesignation)}
                        disabled={actionLoading}
                    />
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="edit-contact-address">
                        <span className="fw-semibold text-dark">Address:</span>
                    </label>
                    <textarea
                        id="edit-contact-address"
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Enter address"
                        value={address}
                        onChange={handleInputChange(setAddress)}
                        disabled={actionLoading}
                    />
                </div>

                {/* Location Hierarchy */}
                <div className="col-12">
                    <h6 className="text-secondary-light border-bottom pb-2 mb-3">Location Details</h6>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-state">
                        <span className="fw-semibold text-dark">State:</span>
                    </label>
                    <select
                        id="edit-contact-state"
                        className="form-select form-select-sm"
                        value={stateId}
                        onChange={(e) => handleStateChange(e.target.value)}
                        disabled={actionLoading || states.length === 0}
                    >
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.id}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-district">
                        <span className="fw-semibold text-dark">District:</span>
                    </label>
                    <select
                        id="edit-contact-district"
                        className="form-select form-select-sm"
                        value={districtId}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={actionLoading || !stateId || districts.length === 0}
                    >
                        <option value="">Select District</option>
                        {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-block">
                        <span className="fw-semibold text-dark">Block:</span>
                    </label>
                    <select
                        id="edit-contact-block"
                        className="form-select form-select-sm"
                        value={blockId}
                        onChange={(e) => handleBlockChange(e.target.value)}
                        disabled={actionLoading || !districtId || blocks.length === 0}
                    >
                        <option value="">Select Block</option>
                        {blocks.map((block) => (
                            <option key={block.id} value={block.id}>
                                {block.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-nac">
                        <span className="fw-semibold text-dark">NAC:</span>
                    </label>
                    <select
                        id="edit-contact-nac"
                        className="form-select form-select-sm"
                        value={nacId}
                        onChange={(e) => handleNacChange(e.target.value)}
                        disabled={actionLoading || !districtId || nacs.length === 0}
                    >
                        <option value="">Select NAC</option>
                        {nacs.map((nac) => (
                            <option key={nac.id} value={nac.id}>
                                {nac.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-gp">
                        <span className="fw-semibold text-dark">GP:</span>
                    </label>
                    <select
                        id="edit-contact-gp"
                        className="form-select form-select-sm"
                        value={gpId}
                        onChange={(e) => handleGpChange(e.target.value)}
                        disabled={actionLoading || !blockId || gps.length === 0}
                    >
                        <option value="">Select GP</option>
                        {gps.map((gp) => (
                            <option key={gp.id} value={gp.id}>
                                {gp.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-village">
                        <span className="fw-semibold text-dark">Village:</span>
                    </label>
                    <select
                        id="edit-contact-village"
                        className="form-select form-select-sm"
                        value={villageId}
                        onChange={(e) => handleVillageChange(e.target.value)}
                        disabled={actionLoading || !gpId || villages.length === 0}
                    >
                        <option value="">Select Village</option>
                        {villages.map((village) => (
                            <option key={village.id} value={village.id}>
                                {village.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-ward">
                        <span className="fw-semibold text-dark">Ward:</span>
                    </label>
                    <select
                        id="edit-contact-ward"
                        className="form-select form-select-sm"
                        value={wardId}
                        onChange={(e) => handleWardChange(e.target.value)}
                        disabled={actionLoading || (!villageId && !nacId) || wards.length === 0}
                    >
                        <option value="">Select Ward</option>
                        {wards.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="edit-contact-booth">
                        <span className="fw-semibold text-dark">Booth:</span>
                    </label>
                    <select
                        id="edit-contact-booth"
                        className="form-select form-select-sm"
                        value={boothId}
                        onChange={(e) => setBoothId(e.target.value || "")}
                        disabled={actionLoading || !wardId || booths.length === 0}
                    >
                        <option value="">Select Booth</option>
                        {booths.map((booth) => (
                            <option key={booth.id} value={booth.id}>
                                {booth.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="border-top pt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={actionLoading || !name.trim() || !mobile.trim()}>
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:content-save" className="me-1" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}