"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useContactStore } from "@/store/useContactStore";
import { useLocationStore } from "@/store/useLocationStore";
import { Icon } from "@iconify/react";

export default function CreateContact({ onSuccess }) {
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
    const [fieldError, setFieldError] = useState("");

    const {
        createContact,
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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

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
                alternateMobile: alternateMobile.trim() || "",
                email: email.trim() || "",
                designation: designation.trim() || "",
                address: address.trim() || "",
                stateId: stateId || null,
                districtId: districtId || null,
                blockId: blockId || null,
                nacId: nacId || null,
                gpId: gpId || null,
                villageId: villageId || null,
                wardId: wardId || null,
                boothId: boothId || null,
            };

            const response = await createContact(contactData);
            console.log("Create Contact Response:", response);
            if (response.success) {
                toast.success(response.message || "Contact created successfully");
                await fetchContacts();
                // Reset form
                setName("");
                setMobile("");
                setAlternateMobile("");
                setEmail("");
                setDesignation("");
                setAddress("");
                setStateId("");
                setDistrictId("");
                setBlockId("");
                setNacId("");
                setGpId("");
                setVillageId("");
                setWardId("");
                setBoothId("");
                onSuccess?.();
            } else {
                const serverError = response.message || "Failed to create contact";
                setFieldError(serverError);
                toast.error(serverError);
            }
        } catch (err) {
            console.error("Error creating contact:", err);
            const serverError = "An error occurred while creating the contact";
            setFieldError(serverError);
            toast.error(serverError);
        }
    }, [name, mobile, alternateMobile, email, designation, address, 
        stateId, districtId, blockId, nacId, gpId, villageId, wardId, boothId,
        createContact, fetchContacts, onSuccess]);

    const handleCancel = useCallback(() => {
        setFieldError("");
        setName("");
        setMobile("");
        setAlternateMobile("");
        setEmail("");
        setDesignation("");
        setAddress("");
        setStateId("");
        setDistrictId("");
        setBlockId("");
        setNacId("");
        setGpId("");
        setVillageId("");
        setWardId("");
        setBoothId("");
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

    const handleInputChange = useCallback((setter) => (e) => {
        setter(e.target.value);
        if (fieldError) setFieldError("");
    }, [fieldError]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                {/* Basic Information */}
                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="create-contact-name">
                        <span className="fw-semibold text-dark">* Contact Name:</span>
                    </label>
                    <input
                        id="create-contact-name"
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
                    <label className="form-label" htmlFor="create-contact-mobile">
                        <span className="fw-semibold text-dark">* Mobile:</span>
                    </label>
                    <input
                        id="create-contact-mobile"
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
                    <label className="form-label" htmlFor="create-contact-alt-mobile">
                        <span className="fw-semibold text-dark">Alternate Mobile:</span>
                    </label>
                    <input
                        id="create-contact-alt-mobile"
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
                    <label className="form-label" htmlFor="create-contact-email">
                        <span className="fw-semibold text-dark">Email:</span>
                    </label>
                    <input
                        id="create-contact-email"
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="Enter email address"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        disabled={actionLoading}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="create-contact-designation">
                        <span className="fw-semibold text-dark">Designation:</span>
                    </label>
                    <input
                        id="create-contact-designation"
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter designation"
                        value={designation}
                        onChange={handleInputChange(setDesignation)}
                        disabled={actionLoading}
                    />
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="create-contact-address">
                        <span className="fw-semibold text-dark">Address:</span>
                    </label>
                    <textarea
                        id="create-contact-address"
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
                    <label className="form-label" htmlFor="create-contact-state">
                        <span className="fw-semibold text-dark">State:</span>
                    </label>
                    <select
                        id="create-contact-state"
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
                    <label className="form-label" htmlFor="create-contact-district">
                        <span className="fw-semibold text-dark">District:</span>
                    </label>
                    <select
                        id="create-contact-district"
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
                    <label className="form-label" htmlFor="create-contact-block">
                        <span className="fw-semibold text-dark">Block:</span>
                    </label>
                    <select
                        id="create-contact-block"
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
                    <label className="form-label" htmlFor="create-contact-nac">
                        <span className="fw-semibold text-dark">NAC:</span>
                    </label>
                    <select
                        id="create-contact-nac"
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
                    <label className="form-label" htmlFor="create-contact-gp">
                        <span className="fw-semibold text-dark">GP:</span>
                    </label>
                    <select
                        id="create-contact-gp"
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
                    <label className="form-label" htmlFor="create-contact-village">
                        <span className="fw-semibold text-dark">Village:</span>
                    </label>
                    <select
                        id="create-contact-village"
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
                    <label className="form-label" htmlFor="create-contact-ward">
                        <span className="fw-semibold text-dark">Ward:</span>
                    </label>
                    <select
                        id="create-contact-ward"
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
                    <label className="form-label" htmlFor="create-contact-booth">
                        <span className="fw-semibold text-dark">Booth:</span>
                    </label>
                    <select
                        id="create-contact-booth"
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
                            Creating...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:plus" className="me-1" />
                            Create Contact
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}