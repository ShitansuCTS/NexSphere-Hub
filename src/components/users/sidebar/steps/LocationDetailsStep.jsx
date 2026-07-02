"use client";

import React, { useEffect, useState } from "react";

const LocationDetailsStep = ({ form, setForm }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [nacs, setNacs] = useState([]);
  const [gps, setGps] = useState([]);
  const [villages, setVillages] = useState([]);
  const [wards, setWards] = useState([]);
  const [booths, setBooths] = useState([]);

  const getData = async (url) => {
    const res = await fetch(url);
    const result = await res.json();
    return result.data || [];
  };

  useEffect(() => {
    const loadDefaultLocation = async () => {
      const stateData = await getData("/api/v1/location/states");
      setStates(stateData);

      const odisha = stateData.find(
        (item) => item.name?.toLowerCase() === "odisha",
      );

      if (!odisha) return;

      const districtData = await getData(
        `/api/v1/location/districts?stateId=${odisha.id}`,
      );
      setDistricts(districtData);

      const puri = districtData.find(
        (item) => item.name?.toLowerCase() === "puri",
      );

      if (!puri) return;

      setForm((prev) => ({
        ...prev,
        stateId: odisha.id,
        districtId: puri.id,
      }));

      const [blockData, nacData] = await Promise.all([
        getData(`/api/v1/location/blocks?districtId=${puri.id}`),
        getData(`/api/v1/location/nacs?districtId=${puri.id}`),
      ]);

      setBlocks(blockData);
      setNacs(nacData);
    };

    loadDefaultLocation();
  }, []);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setForm({
      stateId,
      districtId: "",
      mode: "",
      blockId: "",
      nacId: "",
      gpId: "",
      villageId: "",
      wardId: "",
      boothId: "",
    });

    setDistricts([]);
    setBlocks([]);
    setNacs([]);
    setGps([]);
    setVillages([]);
    setWards([]);
    setBooths([]);

    if (stateId) {
      const data = await getData(
        `/api/v1/location/districts?stateId=${stateId}`,
      );
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;

    setForm((prev) => ({
      ...prev,
      districtId,
      mode: "",
      blockId: "",
      nacId: "",
      gpId: "",
      villageId: "",
      wardId: "",
      boothId: "",
    }));

    setBlocks([]);
    setNacs([]);
    setGps([]);
    setVillages([]);
    setWards([]);
    setBooths([]);

    if (districtId) {
      const [blockData, nacData] = await Promise.all([
        getData(`/api/v1/location/blocks?districtId=${districtId}`),
        getData(`/api/v1/location/nacs?districtId=${districtId}`),
      ]);

      setBlocks(blockData);
      setNacs(nacData);
    }
  };

  const handleModeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      mode: e.target.value,
      blockId: "",
      nacId: "",
      gpId: "",
      villageId: "",
      wardId: "",
      boothId: "",
    }));

    setGps([]);
    setVillages([]);
    setWards([]);
    setBooths([]);
  };

  const handleBlockChange = async (e) => {
    const blockId = e.target.value;

    setForm((prev) => ({
      ...prev,
      blockId,
      gpId: "",
      villageId: "",
      wardId: "",
      boothId: "",
    }));

    setGps([]);
    setVillages([]);
    setWards([]);
    setBooths([]);

    if (blockId) {
      const data = await getData(`/api/v1/location/gps?blockId=${blockId}`);
      setGps(data);
    }
  };

  const handleGpChange = async (e) => {
    const gpId = e.target.value;

    setForm((prev) => ({
      ...prev,
      gpId,
      villageId: "",
      wardId: "",
      boothId: "",
    }));

    setVillages([]);
    setWards([]);
    setBooths([]);

    if (gpId) {
      const data = await getData(`/api/v1/location/villages?gpId=${gpId}`);
      setVillages(data);
    }
  };

  const handleVillageChange = async (e) => {
    const villageId = e.target.value;

    setForm((prev) => ({
      ...prev,
      villageId,
      wardId: "",
      boothId: "",
    }));

    setWards([]);
    setBooths([]);

    if (villageId) {
      const data = await getData(
        `/api/v1/location/wards?villageId=${villageId}`,
      );
      setWards(data);
    }
  };

  const handleNacChange = async (e) => {
    const nacId = e.target.value;

    setForm((prev) => ({
      ...prev,
      nacId,
      wardId: "",
      boothId: "",
    }));

    setWards([]);
    setBooths([]);

    if (nacId) {
      const data = await getData(`/api/v1/location/wards?nacId=${nacId}`);
      setWards(data);
    }
  };

  const handleWardChange = async (e) => {
    const wardId = e.target.value;

    setForm((prev) => ({
      ...prev,
      wardId,
      boothId: "",
    }));

    setBooths([]);

    if (wardId) {
      const data = await getData(`/api/v1/location/booths?wardId=${wardId}`);
      setBooths(data);
    }
  };

  const handleBoothChange = (e) => {
    setForm((prev) => ({
      ...prev,
      boothId: e.target.value,
    }));
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="row gy-3">
          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">State</label>
            <select
              className="form-select"
              name="stateId"
              value={form.stateId}
              onChange={handleStateChange}
            >
              <option value="">Select State</option>
              {states.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">District</label>
            <select
              className="form-select"
              name="districtId"
              value={form.districtId}
              onChange={handleDistrictChange}
              disabled={!form.stateId}
            >
              <option value="">Select District</option>
              {districts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Location Type</label>
            <select
              className="form-select"
              name="mode"
              value={form.mode}
              onChange={handleModeChange}
              disabled={!form.districtId}
            >
              <option value="">Select Type</option>
              <option value="rural">Rural</option>
              <option value="urban">Urban</option>
            </select>
          </div>

          {form.mode === "rural" && (
            <>
              <div className="col-12" style={{ textAlign: "left" }}>
                <label className="form-label">Block</label>
                <select
                  className="form-select"
                  name="blockId"
                  value={form.blockId}
                  onChange={handleBlockChange}
                >
                  <option value="">Select Block</option>
                  {blocks.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12" style={{ textAlign: "left" }}>
                <label className="form-label">GP</label>
                <select
                  className="form-select"
                  name="gpId"
                  value={form.gpId}
                  onChange={handleGpChange}
                  disabled={!form.blockId}
                >
                  <option value="">Select GP</option>
                  {gps.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12" style={{ textAlign: "left" }}>
                <label className="form-label">Village</label>
                <select
                  className="form-select"
                  name="villageId"
                  value={form.villageId}
                  onChange={handleVillageChange}
                  disabled={!form.gpId}
                >
                  <option value="">Select Village</option>
                  {villages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {form.mode === "urban" && (
            <div className="col-12" style={{ textAlign: "left" }}>
              <label className="form-label">NAC</label>
              <select
                className="form-select"
                name="nacId"
                value={form.nacId}
                onChange={handleNacChange}
              >
                <option value="">Select NAC</option>
                {nacs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Ward</label>
            <select
              className="form-select"
              name="wardId"
              value={form.wardId}
              onChange={handleWardChange}
              disabled={form.mode === "rural" ? !form.villageId : !form.nacId}
            >
              <option value="">Select Ward</option>
              {wards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12" style={{ textAlign: "left" }}>
            <label className="form-label">Booth</label>
            <select
              className="form-select"
              name="boothId"
              value={form.boothId}
              onChange={handleBoothChange}
              disabled={!form.wardId}
            >
              <option value="">Select Booth</option>
              {booths.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsStep;
