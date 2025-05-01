import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Innovation from "./pages/innovation";
import Village from "./pages/village";
import { paths } from "Consts/path";
import Innovator from "./pages/innovator";
import Login from "./pages/login";
import Register from "./pages/register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import DetailInnovation from "./pages/innovation/detail";
import DetailVillage from "./pages/village/detail";
import DetailInnovator from "./pages/innovator/detail";
// import ProfileInnovator from "./pages/innovator/form
import AddInnovation from "./pages/innovation/add";
import AddVillage from "./pages/village/form";
import ProfileInnovator from "./pages/innovator/profile";
import { ToastContainer } from "react-toastify";
import InnovatorForm from "./pages/innovator/form";
import EditInnovation from "./pages/innovation/edit";
import EmailReset from "./pages/emailreset/EmailReset";
import NewPassword from "./pages/resetpassword/newpassword/NewPassword";
import ProfileVillage from "./pages/village/profile";
import KlaimInovasi from "./pages/village/klaimInovasi";
import AdminPage from "./pages/admin/AdminPage";
import VerificationPage from "./pages/admin/verification/VerificationPage";
import MakeAds from "./pages/admin/ads/make/MakeAds";
import ResetPassword from "./pages/reset_password/ResetPassword";
import Notification from "./pages/notification/Notification";
import InnovationListPage from "./pages/innovator/detail/ProdukInovasi/InnovationListPage";
import PengajuanInovasi from "./pages/innovator/profile/pengajuanInovasi/PengajuanInovasi";
import PengajuanKlaim from "./pages/village/pengajuanKlaim";
import BantuanFAQ from "./pages/bantuanFAQ";
import DesaYangMenerapkan from "./pages/innovation/desaYangMenerapkan";
import DashboardAdmin from "./pages/admin/dashboard";
import DashboardAdminDesa from "./pages/admin/dashboard/dashboardDesa";
import DashboardAdminInovator from "./pages/admin/dashboard/dashboardInovator";
import DashboardAdminInovasi from "./pages/admin/dashboard/dashboardInovasi";
import DashboardPerangkatDesa from "./pages/village/dashboard";
import RekomendasiInovasi from "./pages/village/dashboard/rekomendasiDashboard";

const queryClient = new QueryClient();

const routes = [
  {
    path: paths.LANDING_PAGE,
    element: <Home />,
    exact: true,
  },
  {
    path: paths.LOGIN_PAGE,
    element: <Login />,
    exact: true,
  },
  {
    path: paths.REGISTER_PAGE,
    element: <Register />,
    exact: true,
  },
  {
    path: paths.VILLAGE_PAGE,
    element: <Village />,
    exact: true,
  },
  {
    path: paths.INNOVATOR_PROFILE_PAGE,
    element: <ProfileInnovator />,
    exact: true,
  },
  {
    path: paths.DETAIL_VILLAGE_PAGE,
    element: <DetailVillage />,
    exact: true,
  },
  {
    path: paths.INNOVATOR_PAGE,
    element: <Innovator />,
    exact: true,
  },

  {
    path: paths.DETAIL_INNOVATOR_PAGE,
    element: <DetailInnovator />,
    exact: true,
  },
  {
    path: paths.INNOVATION_PAGE,
    element: <Innovation />,
    exact: true,
  },
  {
    path: paths.ADD_INNOVATION,
    element: <AddInnovation />,
    exact: true,
  },
  {
    path: paths.INNOVATION_CATEGORY_PAGE,
    element: <Innovation />,
    exact: true,
  },
  {
    path: paths.DETAIL_INNOVATION_PAGE,
    element: <DetailInnovation />,
    exact: true,
  },
  {
    path: paths.EDIT_INNOVATION_PAGE,
    element: <EditInnovation />,
    exact: true,
  },
  {
    path: paths.VILLAGE_FORM,
    element: <AddVillage />,
    exact: true,
  },
  {
    path: paths.INNOVATOR_FORM,
    element: <InnovatorForm />,
    exact: true,
  },
  {
    path: paths.RESET_PASSWORD_PAGE,
    element: <ResetPassword />,
    exact: true,
  },
  {
    path: paths.VILLAGE_PROFILE_PAGE,
    element: <ProfileVillage />,
  },
  {
    path: paths.EMAIL_RESET_PASSWORD_PAGE,
    element: <EmailReset />,
    exact: true,
  },
  {
    path: paths.NEW_PASSWORD_PAGE,
    element: <NewPassword />,
    exact: true,
  },
  {
    path: paths.KLAIM_INOVASI_PAGE,
    element: <KlaimInovasi />,
    exact: true,
  },
  {
    path: paths.NEW_PASSWORD_PAGE,
    element: <NewPassword />,
    exact: true,
  },
  {
    path: paths.ADMIN_PAGE,
    element: <AdminPage />,
    exact: true,
  },
  {
    path: paths.VERIFICATION_PAGE,
    element: <VerificationPage />,
    exact: true,
  },
  {
    path: paths.MAKE_ADS,
    element: <MakeAds />,
    exact: true,
  },
  {
    path: paths.NOTIFICATION_PAGE,
    element: <Notification title={""} description={""} />,
    exact: true,
  },
  {
    path: paths.PRODUK_INOVASI_PAGE,
    element: <InnovationListPage />, // Pastikan komponen ini sesuai
    exact: true,
  },
  {
    path: paths.PENGAJUAN_INOVASI_PAGE,
    element: <PengajuanInovasi />,
    exact: true,
  },
  {
    path: paths.PENGAJUAN_KLAIM_PAGE,
    element: <PengajuanKlaim />, 
    exact: true,
  },
  {
    path: paths.BANTUAN_FAQ_PAGE,
    element: <BantuanFAQ />, 
    exact: true,
  },
  {
    path: paths.DESA_YANG_MENERAPKAN_PAGE,
    element: <DesaYangMenerapkan />,
    exact: true,
  },
  {
    path: paths.ADMIN_DASHBOARD,
    element: <DashboardAdmin />,
    exact: true,
  },
  {
    path: paths.ADMIN_DASHBOARD_DESA,
    element: <DashboardAdminDesa />,
    exact: true,
  },
  {
    path: paths.ADMIN_DASHBOARD_INOVATOR,
    element: <DashboardAdminInovator />,
    exact: true,
  },
  {
    path: paths.ADMIN_DASHBOARD_INOVASI,
    element: <DashboardAdminInovasi />,
    exact: true,
  },
  {
    path: paths.VILLAGE_DASHBOARD,
    element: <DashboardPerangkatDesa />,
    exact: true,
  },
  {
    path: paths.VILLAGE_RECOMENDATION,
    element: <RekomendasiInovasi />,
    exact: true,
  },
];

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <main>
          <Routes>
            {routes.map((data, idx) => (
              <Route key={idx} {...data} />
            ))}
          </Routes>
          <Navbar />
        </main>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
};

export default App;
