import AdminHome from "../pages/admin/AdminHome";
import Regions from "../pages/admin/Regions";
import Teams from "../pages/admin/Teams/Index";
import CreateTeam from "../pages/admin/Teams/CreateTeam";

const adminRoutes = [
    { path: "", element: <AdminHome />, name: "Dashboard", showInNavbar: false },
    { path: "regions", element: <Regions />, name: "Regions", showInNavbar: false },
    { path: "teams", element: <Teams />, name: "Teams", showInNavbar: true },
    { path: "teams/new", element: <CreateTeam />, name: "Create Team", showInNavbar: true },
    { path: "teams/edit/:id", element: <CreateTeam />, name: "Edit Team", showInNavbar: false },
];

export default adminRoutes;