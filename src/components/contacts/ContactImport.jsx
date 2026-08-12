"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useLocationStore } from "@/store/useLocationStore";

const initialLocation = {
  stateId: "",
  districtId: "",
  blockId: "",
  nacId: "",
  gpId: "",
  villageId: "",
  wardId: "",
  boothId: "",
};

export default function ContactImport() {
  const [file, setFile] = useState(null);
  const [selectedLocation, setSelectedLocation] =
    useState(initialLocation);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [failedReportBlob, setFailedReportBlob] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const {
    states,
    districts,
    blocks,
    nacs,
    gps,
    villages,
    wards,
    booths,
    hasFetched,
    fetchLocations,
    setFilter,
  } = useLocationStore();

  // ------------------------------------------------------------
  // Load states
  // ------------------------------------------------------------

  useEffect(() => {
    if (!hasFetched.states) {
      fetchLocations("states", true);
    }
  }, [fetchLocations, hasFetched.states]);

  // ------------------------------------------------------------
  // Reset import result
  // ------------------------------------------------------------

  const resetSummary = () => {
    setSummary(null);
    setFailedReportBlob(null);
  };

  // ------------------------------------------------------------
  // File validation
  // ------------------------------------------------------------

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    const allowedExtensions = [".xlsx", ".xls", ".csv"];

    const fileName = selectedFile.name.toLowerCase();

    const isValidExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isValidExtension) {
      toast.error("Please upload an Excel (.xlsx/.xls) or CSV file.");
      return false;
    }

    // 10 MB limit
    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 10 MB.");
      return false;
    }

    return true;
  };

  // ------------------------------------------------------------
  // File selection
  // ------------------------------------------------------------

  const selectFile = (selectedFile) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    resetSummary();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  };

  // ------------------------------------------------------------
  // Drag and Drop
  // ------------------------------------------------------------

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  // ------------------------------------------------------------
  // Location loading
  // ------------------------------------------------------------

  const loadLocations = async (type, updates = {}) => {
    Object.entries(updates).forEach(([key, value]) => {
      setFilter(key, value);
    });

    return fetchLocations(type, true);
  };

  // ------------------------------------------------------------
  // Location changes
  // ------------------------------------------------------------

  const handleLocationChange = async (key, value) => {
    const normalizedValue = value || "";

    const clearMap = {
      stateId: [
        "districtId",
        "blockId",
        "nacId",
        "gpId",
        "villageId",
        "wardId",
        "boothId",
      ],

      districtId: [
        "blockId",
        "nacId",
        "gpId",
        "villageId",
        "wardId",
        "boothId",
      ],

      blockId: [
        "gpId",
        "villageId",
        "wardId",
        "boothId",
      ],

      nacId: [
        "wardId",
        "boothId",
      ],

      gpId: [
        "villageId",
        "wardId",
        "boothId",
      ],

      villageId: [
        "wardId",
        "boothId",
      ],

      wardId: [
        "boothId",
      ],

      boothId: [],
    };

    const nextLocation = {
      ...selectedLocation,
      [key]: normalizedValue,
    };

    clearMap[key].forEach((field) => {
      nextLocation[field] = "";
    });

    setSelectedLocation(nextLocation);
    resetSummary();

    if (!normalizedValue) {
      return;
    }

    try {
      switch (key) {
        case "stateId":
          await loadLocations("districts", {
            stateId: normalizedValue,
          });
          break;

        case "districtId":
          await loadLocations("blocks", {
            districtId: normalizedValue,
          });

          await loadLocations("nacs", {
            districtId: normalizedValue,
          });
          break;

        case "blockId":
          await loadLocations("gps", {
            blockId: normalizedValue,
          });
          break;

        case "gpId":
          await loadLocations("villages", {
            gpId: normalizedValue,
          });
          break;

        case "nacId":
        case "villageId":
          await loadLocations("wards", {
            nacId: nextLocation.nacId,
            villageId: nextLocation.villageId,
          });
          break;

        case "wardId":
          await loadLocations("booths", {
            wardId: normalizedValue,
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Location loading error:", error);
      toast.error("Failed to load location data.");
    }
  };

  // ------------------------------------------------------------
  // Download failed report
  // ------------------------------------------------------------

  const downloadFailedReport = () => {
    if (!failedReportBlob) {
      toast.error("Failed records report is not available.");
      return;
    }

    const url = window.URL.createObjectURL(failedReportBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "failed_contacts_report.xlsx";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // Import
  // ------------------------------------------------------------

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select an Excel or CSV file to import.");
      return;
    }

    setLoading(true);
    resetSummary();

    const formData = new FormData();

    formData.append("file", file);

    Object.entries(selectedLocation).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch("/api/v1/contacts/import", {
        method: "POST",
        body: formData,
      });

      // --------------------------------------------------------
      // Successful import
      // --------------------------------------------------------

      if (response.ok && response.status !== 207) {
        const result = await response.json();

        const totalCount =
          result.totalRows ??
          result.totalCount ??
          result.total ??
          result.validContactsForDb?.length ??
          0;

        const successCount =
          result.successRows ??
          result.successCount ??
          result.importedCount ??
          result.validContactsForDb?.length ??
          0;

        const failedCount =
          result.failedRows ??
          result.failedCount ??
          result.failedContacts?.length ??
          0;

        setSummary({
          type: "success",
          message:
            result.message || "Import completed successfully.",
          total: totalCount,
          imported: successCount,
          failed: failedCount,
        });

        toast.success(
          result.message || "Contacts imported successfully!"
        );
      }

      // --------------------------------------------------------
      // Partial import - 207
      // --------------------------------------------------------

      else if (response.status === 207) {
        const blob = await response.blob();

        setFailedReportBlob(blob);

        const total =
          Number(response.headers.get("X-Import-Total")) || 0;

        const imported =
          Number(response.headers.get("X-Import-Success")) || 0;

        const failed =
          Number(response.headers.get("X-Import-Failed")) || 0;

        setSummary({
          type: "warning",
          message:
            "Import completed with some failed records.",
          total,
          imported,
          failed,
        });

        toast.warn(
          "Some contacts failed to import. The failed records report has been downloaded."
        );

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "failed_contacts_report.xlsx";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);
      }

      // --------------------------------------------------------
      // Server-side error
      // --------------------------------------------------------

      else {
        let errorMessage = "An unknown error occurred.";

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          errorMessage = `Import failed with status ${response.status}.`;
        }

        toast.error(errorMessage);

        setSummary({
          type: "error",
          message: errorMessage,
          total: 0,
          imported: 0,
          failed: 0,
        });
      }
    } catch (error) {
      console.error("Import error:", error);

      toast.error(
        "Import failed. Please check your file and try again."
      );

      setSummary({
        type: "error",
        message:
          "Import failed. Please check your file and try again.",
        total: 0,
        imported: 0,
        failed: 0,
      });
    } finally {
      setLoading(false);

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ------------------------------------------------------------
  // Reset everything
  // ------------------------------------------------------------

  const handleReset = () => {
    setFile(null);
    setSummary(null);
    setFailedReportBlob(null);
    setSelectedLocation(initialLocation);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="card h-100 p-0 radius-12 mb-4">
      {/* -------------------------------------------------------
          Header
      -------------------------------------------------------- */}

      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h5 className="mb-1">Contact Import</h5>

            <p className="text-secondary-light mb-0">
              Upload contacts in bulk using an Excel or CSV file.
              You can provide default location values below for
              rows where location information is missing.
            </p>
          </div>

          <a
            href="/api/v1/contacts/template"
            download="contacts_import_template.xlsx"
            className="btn btn-outline-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon
              icon="mdi:download"
              className="icon text-xl line-height-1"
            />
            Download Template
          </a>
        </div>
      </div>

      {/* -------------------------------------------------------
          Body
      -------------------------------------------------------- */}

      <div className="card-body p-24">

        {/* -----------------------------------------------------
            Location Section
        ------------------------------------------------------ */}

        <div className="card border radius-12 mb-24">
          <div className="card-header border-bottom bg-base py-16 px-20">
            <div className="d-flex align-items-center gap-3">
              <div className="w-40-px h-40-px radius-8 bg-primary-50 d-flex align-items-center justify-content-center">
                <Icon
                  icon="mdi:map-marker-outline"
                  className="text-primary-600 text-xl"
                />
              </div>

              <div>
                <h6 className="mb-1">Default Location</h6>

                <small className="text-secondary-light">
                  These values are used when the corresponding
                  location is blank in the uploaded file.
                </small>
              </div>
            </div>
          </div>

          <div className="card-body p-20">

            <div className="alert alert-light border radius-8 mb-20">
              <div className="d-flex align-items-start gap-2">
                <Icon
                  icon="mdi:information-outline"
                  className="text-primary-600 text-xl mt-1"
                />

                <small className="text-secondary-light">
                  <strong>Location hierarchy:</strong>{" "}
                  State → District → Block → GP → Village →
                  Ward → Booth
                  <br />
                  <span>
                    NAC can be used instead of Block/GP/Village
                    where applicable.
                  </span>
                </small>
              </div>
            </div>

            <div className="row g-3">

              {/* State */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  State
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.stateId}
                  onChange={(event) =>
                    handleLocationChange(
                      "stateId",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select state
                  </option>

                  {states.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  District
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.districtId}
                  onChange={(event) =>
                    handleLocationChange(
                      "districtId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.stateId}
                >
                  <option value="">
                    Select district
                  </option>

                  {districts.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Block
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.blockId}
                  onChange={(event) =>
                    handleLocationChange(
                      "blockId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.districtId}
                >
                  <option value="">
                    Select block
                  </option>

                  {blocks.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAC */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  NAC
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.nacId}
                  onChange={(event) =>
                    handleLocationChange(
                      "nacId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.districtId}
                >
                  <option value="">
                    Select NAC
                  </option>

                  {nacs.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* GP */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  GP
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.gpId}
                  onChange={(event) =>
                    handleLocationChange(
                      "gpId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.blockId}
                >
                  <option value="">
                    Select GP
                  </option>

                  {gps.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Village
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.villageId}
                  onChange={(event) =>
                    handleLocationChange(
                      "villageId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.gpId}
                >
                  <option value="">
                    Select village
                  </option>

                  {villages.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Ward
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.wardId}
                  onChange={(event) =>
                    handleLocationChange(
                      "wardId",
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedLocation.villageId &&
                    !selectedLocation.nacId
                  }
                >
                  <option value="">
                    Select ward
                  </option>

                  {wards.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booth */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Booth
                </label>

                <select
                  className="form-select radius-8"
                  value={selectedLocation.boothId}
                  onChange={(event) =>
                    handleLocationChange(
                      "boothId",
                      event.target.value
                    )
                  }
                  disabled={!selectedLocation.wardId}
                >
                  <option value="">
                    Select booth
                  </option>

                  {booths.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* -----------------------------------------------------
            Template Section
        ------------------------------------------------------ */}

        <div className="card border radius-12 mb-24">
          <div className="card-body p-20">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

              <div className="d-flex align-items-center gap-3">
                <div className="w-40-px h-40-px radius-8 bg-primary-50 d-flex align-items-center justify-content-center">
                  <Icon
                    icon="mdi:file-excel-outline"
                    className="text-primary-600 text-xl"
                  />
                </div>

                <div>
                  <h6 className="mb-1">
                    Download Import Template
                  </h6>

                  <p className="text-secondary-light mb-0">
                    Use the sample Excel template to ensure
                    your contact data has the correct columns
                    and location names.
                  </p>
                </div>
              </div>

              <a
                href="/api/v1/contacts/template"
                download="contacts_import_template.xlsx"
                className="btn btn-outline-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              >
                <Icon
                  icon="mdi:download"
                  className="icon text-xl line-height-1"
                />
                Download Template
              </a>

            </div>
          </div>
        </div>

        {/* -----------------------------------------------------
            Upload Section
        ------------------------------------------------------ */}

        <div className="card border radius-12 mb-24">
          <div className="card-header border-bottom bg-base py-16 px-20">
            <div className="d-flex align-items-center gap-3">
              <div className="w-40-px h-40-px radius-8 bg-primary-50 d-flex align-items-center justify-content-center">
                <Icon
                  icon="mdi:cloud-upload-outline"
                  className="text-primary-600 text-xl"
                />
              </div>

              <div>
                <h6 className="mb-1">
                  Upload Contacts
                </h6>

                <small className="text-secondary-light">
                  Supported formats: Excel (.xlsx, .xls) and
                  CSV. Maximum file size: 10 MB.
                </small>
              </div>
            </div>
          </div>

          <div className="card-body p-20">

            <div
              className={`border radius-12 p-24 text-center ${
                dragActive
                  ? "border-primary bg-primary-50"
                  : "border-dashed"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <div className="d-flex justify-content-center mb-3">
                <div className="w-56-px h-56-px radius-12 bg-primary-50 d-flex align-items-center justify-content-center">
                  <Icon
                    icon="mdi:cloud-upload-outline"
                    className="text-primary-600 text-3xl"
                  />
                </div>
              </div>

              <h6 className="mb-1">
                {dragActive
                  ? "Drop your file here"
                  : "Drag & drop your file here"}
              </h6>

              <p className="text-secondary-light mb-3">
                or click to browse from your computer
              </p>

              <button
                type="button"
                className="btn btn-outline-primary text-sm btn-sm d-flex align-items-center justify-content-center mx-auto px-12 py-10 radius-8"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Icon
                  icon="mdi:folder-open-outline"
                  className="icon me-1"
                />
                Choose File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="d-none"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected file */}

            {file && (
              <div className="mt-20">
                <div className="border border-success-subtle bg-success-50 radius-8 p-16 d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-40-px h-40-px radius-8 bg-success-100 d-flex align-items-center justify-content-center">
                      <Icon
                        icon="mdi:file-check-outline"
                        className="text-success-600 text-xl"
                      />
                    </div>

                    <div>
                      <strong className="d-block">
                        {file.name}
                      </strong>

                      <span className="small text-secondary-light">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger radius-8"
                    onClick={() => {
                      setFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <Icon
                      icon="mdi:close"
                      className="icon me-1"
                    />
                    Remove
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* -----------------------------------------------------
            Import Actions
        ------------------------------------------------------ */}

        <div className="d-flex flex-wrap gap-2 mb-24">

          <button
            type="button"
            className="btn btn-primary text-sm btn-sm px-16 py-12 radius-8 d-flex align-items-center gap-2"
            onClick={handleImport}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />

                Importing...
              </>
            ) : (
              <>
                <Icon
                  icon="mdi:cloud-upload-outline"
                  className="icon text-xl line-height-1"
                />

                Upload & Import Contacts
              </>
            )}
          </button>

          {(file || summary) && !loading && (
            <button
              type="button"
              className="btn btn-outline-secondary text-sm btn-sm px-16 py-12 radius-8 d-flex align-items-center gap-2"
              onClick={handleReset}
            >
              <Icon
                icon="mdi:refresh"
                className="icon text-xl line-height-1"
              />

              Reset
            </button>
          )}

        </div>

        {/* -----------------------------------------------------
            Import Summary
        ------------------------------------------------------ */}

        {summary && (
          <div className="card border radius-12 mb-24">

            <div className="card-header border-bottom bg-base py-16 px-20">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div className="d-flex align-items-center gap-3">
                  <div className="w-40-px h-40-px radius-8 bg-primary-50 d-flex align-items-center justify-content-center">
                    <Icon
                      icon="mdi:clipboard-text-outline"
                      className="text-primary-600 text-xl"
                    />
                  </div>

                  <div>
                    <h6 className="mb-1">
                      Import Summary
                    </h6>

                    <small className="text-secondary-light">
                      Results from the latest import
                    </small>
                  </div>
                </div>

                {summary.type === "success" && (
                  <span className="badge bg-success">
                    Completed
                  </span>
                )}

                {summary.type === "warning" && (
                  <span className="badge bg-warning text-dark">
                    Partial Success
                  </span>
                )}

                {summary.type === "error" && (
                  <span className="badge bg-danger">
                    Failed
                  </span>
                )}

              </div>
            </div>

            <div className="card-body p-20">

              <p className="text-secondary-light mb-20">
                {summary.message}
              </p>

              <div className="row g-3">

                {/* Total */}

                <div className="col-12 col-md-4">
                  <div className="border radius-12 p-16 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        icon="mdi:format-list-numbered"
                        className="text-secondary-light text-xl"
                      />

                      <small className="text-secondary-light">
                        Total Records
                      </small>
                    </div>

                    <div className="fs-3 fw-semibold">
                      {summary.total ?? 0}
                    </div>
                  </div>
                </div>

                {/* Imported */}

                <div className="col-12 col-md-4">
                  <div className="border border-success-subtle radius-12 p-16 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        icon="mdi:check-circle-outline"
                        className="text-success-600 text-xl"
                      />

                      <small className="text-success">
                        Successfully Imported
                      </small>
                    </div>

                    <div className="fs-3 fw-semibold text-success">
                      {summary.imported ?? 0}
                    </div>
                  </div>
                </div>

                {/* Failed */}

                <div className="col-12 col-md-4">
                  <div className="border border-danger-subtle radius-12 p-16 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon
                        icon="mdi:alert-circle-outline"
                        className="text-danger-600 text-xl"
                      />

                      <small className="text-danger">
                        Failed Records
                      </small>
                    </div>

                    <div className="fs-3 fw-semibold text-danger">
                      {summary.failed ?? 0}
                    </div>
                  </div>
                </div>

              </div>

              {/* Failed report */}

              {failedReportBlob && (
                <div className="alert alert-warning border radius-8 mt-20 mb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                  <div className="d-flex align-items-start gap-2">
                    <Icon
                      icon="mdi:file-alert-outline"
                      className="text-warning text-xl mt-1"
                    />

                    <div>
                      <strong className="d-block">
                        Failed records report available
                      </strong>

                      <div className="small text-secondary-light">
                        The report contains the original
                        failed records along with the reason
                        for failure.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-warning text-sm btn-sm px-12 py-10 radius-8 d-flex align-items-center gap-2"
                    onClick={downloadFailedReport}
                  >
                    <Icon
                      icon="mdi:download"
                      className="icon"
                    />

                    Download Failed Records
                  </button>

                </div>
              )}

            </div>
          </div>
        )}

        {/* -----------------------------------------------------
            Help text
        ------------------------------------------------------ */}

        <div className="alert alert-light border radius-8 mb-0">
          <div className="d-flex align-items-start gap-2">
            <Icon
              icon="mdi:lightbulb-outline"
              className="text-primary-600 text-xl mt-1"
            />

            <small className="text-secondary-light">
              <strong>Tip:</strong> Download the template first
              and keep the location names exactly as they appear
              in your system. If a location field is blank,
              the selected default location above will be used.
            </small>
          </div>
        </div>

      </div>
    </div>
  );
}