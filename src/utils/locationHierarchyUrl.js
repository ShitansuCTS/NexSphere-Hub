export function buildHierarchyUrl(params = {}) {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            search.set(key, value);
        }
    });

    const query = search.toString();
    return query ? `/location/hierarchy?${query}` : "/location/hierarchy";
}

export function getStateHierarchyUrl(state) {
    return buildHierarchyUrl({ stateId: state.id });
}

export function getDistrictHierarchyUrl(district) {
    return buildHierarchyUrl({
        stateId: district.stateId || district.state?.id,
        districtId: district.id,
    });
}

export function getBlockHierarchyUrl(block) {
    const district = block.district;
    return buildHierarchyUrl({
        stateId: district?.stateId || district?.state?.id,
        districtId: block.districtId || district?.id,
        areaType: "rural",
        blockId: block.id,
    });
}

export function getNacHierarchyUrl(nac) {
    const district = nac.district;
    return buildHierarchyUrl({
        stateId: district?.stateId || district?.state?.id,
        districtId: nac.districtId || district?.id,
        areaType: "urban",
        nacId: nac.id,
    });
}

export function getGpHierarchyUrl(gp) {
    const block = gp.block;
    const district = block?.district;
    return buildHierarchyUrl({
        stateId: district?.stateId || district?.state?.id,
        districtId: district?.id,
        areaType: "rural",
        blockId: gp.blockId || block?.id,
        gpId: gp.id,
    });
}

export function getVillageHierarchyUrl(village) {
    const gp = village.gp;
    const block = gp?.block;
    const district = block?.district;
    return buildHierarchyUrl({
        stateId: district?.stateId || district?.state?.id,
        districtId: district?.id,
        areaType: "rural",
        blockId: block?.id,
        gpId: village.gpId || gp?.id,
        villageId: village.id,
    });
}

export function getWardHierarchyUrl(ward) {
    if (ward.nacId || ward.nac) {
        const district = ward.nac?.district;
        return buildHierarchyUrl({
            stateId: district?.stateId || district?.state?.id,
            districtId: ward.nac?.districtId || district?.id,
            areaType: "urban",
            nacId: ward.nacId || ward.nac?.id,
            wardId: ward.id,
        });
    }

    const village = ward.village;
    const gp = village?.gp;
    const block = gp?.block;
    const district = block?.district;

    return buildHierarchyUrl({
        stateId: district?.stateId || district?.state?.id,
        districtId: district?.id,
        areaType: "rural",
        blockId: block?.id,
        gpId: gp?.id,
        villageId: ward.villageId || village?.id,
        wardId: ward.id,
    });
}

export function getBoothHierarchyUrl(booth) {
    if (booth.ward) {
        return getWardHierarchyUrl(booth.ward);
    }

    return buildHierarchyUrl({ wardId: booth.wardId });
}
