"use client";

import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

const CONTACT_ITEMS = [
  {
    href: "/contacts",
    label: "Contacts",
    icon: "mdi:account-group-outline",
    match: (path) => path === "/contacts" || (path.startsWith("/contacts/") && path !== "/contacts/import"),
  },
  {
    href: "/contacts/import",
    label: "Import",
    icon: "mdi:upload-outline",
    match: (path) => path === "/contacts/import",
  },
];

const LOCATION_ITEMS = [
  {
    href: "/location/hierarchy",
    label: "Hierarchy",
    icon: "mdi:sitemap-outline",
    match: (path) => path === "/location/hierarchy",
  },
  {
    href: "/location/states",
    label: "States",
    icon: "mdi:map-marker-radius-outline",
    match: (path) => path.startsWith("/location/states"),
  },
  {
    href: "/location/districts",
    label: "Districts",
    icon: "mdi:map-outline",
    match: (path) => path.startsWith("/location/districts"),
  },
  {
    href: "/location/blocks",
    label: "Blocks",
    icon: "mdi:home-group-outline",
    match: (path) => path.startsWith("/location/blocks"),
  },
  {
    href: "/location/nacs",
    label: "NACs",
    icon: "mdi:city-variant-outline",
    match: (path) => path.startsWith("/location/nacs"),
  },
  {
    href: "/location/gps",
    label: "GPs",
    icon: "mdi:google-circles-communities",
    match: (path) => path.startsWith("/location/gps"),
  },
  {
    href: "/location/villages",
    label: "Villages",
    icon: "mdi:home-outline",
    match: (path) => path.startsWith("/location/villages"),
  },
  {
    href: "/location/wards",
    label: "Wards",
    icon: "mdi:sign-direction-outline",
    match: (path) => path.startsWith("/location/wards"),
  },
  {
    href: "/location/booths",
    label: "Booths",
    icon: "mdi:vote-outline",
    match: (path) => path.startsWith("/location/booths"),
  },
];

function NavLinks({ items, pathname }) {
  return items.map((item) => {
    const isActive = item.match(pathname);

    return (
      <li key={item.href}>
        <Link href={item.href} className={isActive ? "active-page" : ""}>
          <Icon icon={item.icon} className="menu-icon" />
          <span>{item.label}</span>
        </Link>
      </li>
    );
  });
}

export default function AppSidebar({ pathname = "" }) {
  return (
    <div className="sidebar-menu-area">
      <ul className="sidebar-menu" id="sidebar-menu">
        <li className="sidebar-menu-group-title">Contacts</li>
        <NavLinks items={CONTACT_ITEMS} pathname={pathname} />

        <li className="sidebar-menu-group-title">Location</li>
        <NavLinks items={LOCATION_ITEMS} pathname={pathname} />
      </ul>
    </div>
  );
}
