import AdminHome from "../pages/admin/AdminHome";
import Regions from "../pages/admin/Regions";

const adminRoutes = [
    { path: "", element: <AdminHome />, name: "Dashboard" },
    { path: "regions", element: <Regions />, name: "Regions" },
];

export default adminRoutes;