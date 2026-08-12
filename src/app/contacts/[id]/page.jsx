"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";
import Offcanvas from "@/components/sidebar/offcanvas";
import UpdateContact from "@/components/contacts/forms/UpdateContact";
import ContactProfileSkeleton from "@/components/loader/ContactProfileSkeleton";
import ProfileDetailsSkeleton from "@/components/loader/ProfileDetailsSkeleton";
import toast from "react-hot-toast";

export default function ContactProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading profile picture...");
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`/api/v1/contacts/${id}/profile-picture`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.data) {
        setContact((prevContact) => ({
          ...prevContact,
          profilePicture: json.data.profilePicture,
        }));
        toast.update(toastId, {
          render: json.message || "Profile picture updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(toastId, {
          render: json.message || "Failed to upload profile picture",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        setImagePreview(contact?.profilePicture || null); // Revert preview
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.update(toastId, {
        render: "An error occurred during image upload",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setImagePreview(contact?.profilePicture || null); // Revert preview
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/contacts/${id}`);
        const json = await res.json();
        const data = json.data || json.contact || json;
        if (data?.profilePicture) {
          setImagePreview(data.profilePicture);
        }
        setContact(data || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load contact");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this contact? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/v1/contacts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Contact deleted");
        router.push("/contacts");
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const getContactState = () => {
    return (
      contact.block?.district?.state?.name ||
      contact.nac?.district?.state?.name ||
      contact.gp?.block?.district?.state?.name ||
      contact.village?.gp?.block?.district?.state?.name ||
      contact.ward?.village?.gp?.block?.district?.state?.name ||
      contact.ward?.nac?.district?.state?.name ||
      contact.booth?.ward?.village?.gp?.block?.district?.state?.name ||
      "-"
    );
  };

  const getContactDistrict = () => {
    return (
      contact.block?.district?.name ||
      contact.nac?.district?.name ||
      contact.gp?.block?.district?.name ||
      contact.village?.gp?.block?.district?.name ||
      contact.ward?.village?.gp?.block?.district?.name ||
      contact.ward?.nac?.district?.name ||
      contact.booth?.ward?.village?.gp?.block?.district?.name ||
      "-"
    );
  };

  const getFullLocationAddress = () => {
    const parts = [];

    if (contact.address) {
      parts.push(contact.address.trim());
    }

    const boothName = contact.booth?.name;
    const wardName = contact.ward?.name;
    const villageName = contact.village?.name;
    const gpName = contact.gp?.name;
    const blockName = contact.block?.name;
    const districtName = getContactDistrict();
    const stateName = getContactState();

    if (boothName) parts.push(boothName);
    if (wardName) parts.push(wardName);
    if (villageName) parts.push(villageName);
    if (gpName) parts.push(gpName);
    if (blockName) parts.push(blockName);
    if (districtName && districtName !== "-") parts.push(districtName);
    if (stateName && stateName !== "-") parts.push(stateName);

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="container-fluid">
          <Breadcrumb title="Contact Profile" />
          <div className="row gy-4">
            <div className="col-lg-4">
              <ContactProfileSkeleton />
            </div>
            <div className="col-lg-8">
              <ProfileDetailsSkeleton />
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  if (!contact) {
    return (
      <MasterLayout>
        <div className="container-fluid">
          <Breadcrumb title="Contact Profile" />
          <div className="row gy-4">
            <div className="col-12">
              <div className="card p-4 text-center">
                <h6 className="mb-2">Contact not found</h6>
                <p className="text-secondary-light">
                  The requested contact does not exist or was removed.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <Link href="/contacts" className="btn btn-outline-primary btn-sm">
                    Back to contacts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  // pick an image index to reuse user-grid assets (deterministic-ish)
  const numericHash = Math.abs(String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
  const imageIndex = (numericHash % 12) + 1;
  const bgImage = `https://t3.ftcdn.net/jpg/03/51/32/12/360_F_351321223_YZzIv6IPGGRcSFm0TErJcS82L5ndpbrD.jpg`; // Keep background image static
  
  const getSafeUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("data:")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  };

  const avatarImage =
    getSafeUrl(imagePreview) ||
    getSafeUrl(contact.profilePicture) ||
    `/assets/images/user-grid/user-grid-img${imageIndex}.png`;

  return (
    <MasterLayout>
      <div className="container-fluid">
        <Breadcrumb title="Contact Profile" />

        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
              <img src={bgImage} alt="profile cover" className="w-100 object-fit-cover" />
              <div className="pb-24 ms-16 mb-24 me-16 mt--100">
                <div className="text-center border border-top-0 border-start-0 border-end-0">
                  {/* <img
                    src={avatarImage}
                    alt="avatar"
                    className="border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover"
                  /> */}

                    <div className="mb-24 mt-16">
                      <div className="avatar-upload mx-auto">
                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                          <input
                            type="file"
                            id="imageUpload"
                            accept=".png, .jpg, .jpeg"
                            hidden
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <label
                            htmlFor="imageUpload"
                            className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                          >
                            <Icon icon="solar:camera-outline" className="icon" />
                          </label>
                        </div>
                        <div className="avatar-preview">
                          <div
                            id="imagePreview"
                            style={{
                              backgroundImage: `url(${avatarImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              width: "150px", // Ensure consistent size
                              height: "150px",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  <h6 className="mb-0 mt-16">{contact.name}</h6>
                  <span className="text-secondary-light d-block mb-8">
                    {contact.email || "No email"}
                  </span>
                  <span className="text-secondary-light d-block">
                    {contact.mobile || "No phone"}
                  </span>
                </div>
                <div className="d-flex flex-wrap justify-content-center align-items-center mt-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEdit(true)}
                      className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
                    >
                    <Icon icon='uil:edit' className='text-xl' />  Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="btn btn-sm btn-danger-600 radius-8 d-inline-flex align-items-center gap-1"
                    >
                    <Icon icon='basil:trash-outline' className='text-xl' />  Delete
                    </button>
                  </div>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card h-100">
              <div className="card-body p-24">
                {/* <div className="d-flex flex-wrap justify-content-between gap-3 mb-20">
                  <div>
                    <h5 className="mb-1">Profile Details</h5>
                    <p className="text-secondary-light mb-0">Review contact and location information.</p>
                  </div>
                  
                </div> */}

                <ul className="nav border-gradient-tab nav-pills mb-20 d-inline-flex" id="pills-tab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link d-flex align-items-center px-24 active"
                      id="pills-profile-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-profile"
                      type="button"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="true"
                    >
                      Profile
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link d-flex align-items-center px-24"
                      id="pills-location-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-location"
                      type="button"
                      role="tab"
                      aria-controls="pills-location"
                      aria-selected="false"
                    >
                      Location
                    </button>
                  </li>
                </ul>

                <div className="tab-content" id="pills-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                    tabIndex={0}
                  >
                    
                    <div className="row gy-3">
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Full Name</span>
                          <strong>{contact.name || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Email</span>
                          <strong>{contact.email || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Phone</span>
                          <strong>{contact.mobile || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Alternate Mobile</span>
                          <strong>{contact.alternateMobile || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Designation</span>
                          <strong>{contact.designation || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Import ID</span>
                          <strong>{contact.importId || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Status</span>
                          <strong>{contact.isActive ? "Active" : "Inactive"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Created At</span>
                          <strong>{new Date(contact.createdAt).toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Updated At</span>
                          <strong>{new Date(contact.updatedAt).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="pills-location"
                    role="tabpanel"
                    aria-labelledby="pills-location-tab"
                    tabIndex={0}
                  >
                    <div className="row gy-3">
                      <div className="col-sm-12">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Address</span>
                          <strong>{getFullLocationAddress()}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">State</span>
                          <strong>{getContactState()}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">District</span>
                          <strong>{getContactDistrict()}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Block</span>
                          <strong>{contact.block?.name || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">GP</span>
                          <strong>{contact.gp?.name || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Village</span>
                          <strong>{contact.village?.name || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Ward</span>
                          <strong>{contact.ward?.name || "-"}</strong>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div>
                          <span className="d-block text-secondary-light mb-2">Booth</span>
                          <strong>{contact.booth?.name || "-"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <Offcanvas show={showEdit} title="Update Contact" subtitle="Modify the contact details." onClose={() => setShowEdit(false)}>
        {showEdit && <UpdateContact contactId={contact.id} onSuccess={() => { setShowEdit(false); router.refresh && router.refresh(); }} />}
      </Offcanvas>
    </div>
  </MasterLayout>
);
}
