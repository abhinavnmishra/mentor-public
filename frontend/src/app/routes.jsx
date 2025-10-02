import {lazy, useContext} from "react";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";

const Dashboard = Loadable(lazy(() => import("./mentor/views/Dashboard")));
const Clients = Loadable(lazy(() => import("./mentor/views/Clients")));
const AssessmentWizard = Loadable(lazy(() => import("./mentor/views/AssessmentWizard")));
const FormWizard = Loadable(lazy(() => import("./mentor/views/FormWizard")));
const FormEditor = Loadable(lazy(() => import("./mentor/views/FormEditor")));
const ReportWizard = Loadable(lazy(() => import("./mentor/views/ReportWizard")));
const ReportView = Loadable(lazy(() => import("./mentor/views/ReportView")));
const Contracts = Loadable(lazy(() => import("./mentor/views/Contracts")));
const Rules = Loadable(lazy(() => import("./mentor/views/Rules")));
const AgreementEditor = Loadable(lazy(() => import("./mentor/views/AgreementEditor")));
const FormResponseViewMode = Loadable(lazy(() => import("./mentor/views/FormResponseViewMode")));
const ProfileCustomisation = Loadable(lazy(() => import("./mentor/views/ProfileCustomisation")));
const RoleBasedRedirect = Loadable(lazy(() => import("./Redirect.jsx")));

const ClientDashboard = Loadable(lazy(() => import("./mentor/client/views/Dashboard")));
const Milestones = Loadable(lazy(() => import("./mentor/client/views/Milestones")));

const routes = [
  { path: "/", element: <RoleBasedRedirect/> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/portal/dashboard", element: <Dashboard />, auth: authRoles.admin },
      { path: "/portal/clients", element: <Clients />, auth: authRoles.admin },
      { path: "/portal/profile", element: <ProfileCustomisation />, auth: authRoles.admin },
      { path: "/portal/contracts", element: <Contracts />, auth: authRoles.admin },
      { path: "/portal/rules", element: <Rules />, auth: authRoles.admin },
      { path: "/portal/form", element: <FormWizard />, auth: authRoles.admin },
      { path: "/portal/form/create", element: <FormEditor />, auth: authRoles.admin },
      { path: "/portal/form/edit/:formId", element: <FormEditor />, auth: authRoles.admin },
      { path: "/portal/survey/:surveyId", element: <AssessmentWizard />, auth: authRoles.admin },
      { path: "/portal/report/:programId", element: <ReportWizard />, auth: authRoles.admin },
      { path: "/portal/report-view/:reportId", element: <ReportView />, auth: authRoles.admin },
      { path: "/portal/form/view/:formResponseId", element: <FormResponseViewMode />, auth: authRoles.admin },
      { path: "/portal/agreements/create", element: <AgreementEditor />, auth: authRoles.admin },
      { path: "/portal/agreements/:agreementId/new-version", element: <AgreementEditor />, auth: authRoles.admin },
      { path: "/portal/agreements/:agreementId/versions/:versionId/edit", element: <AgreementEditor />, auth: authRoles.admin },
      { path: "/client/milestones/:programId", element: <Milestones />, auth: authRoles.admin }
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;
