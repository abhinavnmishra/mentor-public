const navigations = [
  { label: "HOME", type: "label" },
  { name: "Dashboard", path: "/portal/dashboard", icon: "widgets" },
  { label: "USERS", type: "label" },
  { name: "Clients", path: "/portal/clients", icon: "people" },
  { name: "Trainers", path: "/portal/trainers", icon: "local_library" },
  { label: "SELF", type: "label" },
  { name: "Profile Settings", path: "/portal/profile", icon: "palette" },
  { label: "ORGANISATION", type: "label" },
  { name: "Agreements", path: "/portal/contracts", icon: "gavel" },
  { name: "Forms", path: "/portal/form", icon: "checklist" },
  { name: "Rules", path: "/portal/rules", icon: "tune" },
  { label: "DOCS", type: "label" },
  {
    name: "Learn More",
    icon: "launch",
    type: "extLink",
    path: "https://mentivo.ai"
  }
];

export default navigations;
