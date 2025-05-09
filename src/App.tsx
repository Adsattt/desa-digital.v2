import { paths } from "Consts/path";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Innovation from "./pages/innovation";
import DetailInnovation from "./pages/innovation/detail";
import Innovator from "./pages/innovator";
import DetailInnovator from "./pages/innovator/detail";
import Login from "./pages/login";
import Register from "./pages/register";
import Village from "./pages/village";
import DetailVillage from "./pages/village/detail";
// import ProfileInnovator from "./pages/innovator/form
import AdminGuard from "./pages/admin/AdminGuard";
import AdminPage from "./pages/admin/AdminPage";
import MakeAds from "./pages/admin/ads/make/MakeAds";
import DashboardAdmin from "./pages/admin/dashboard";
import DashboardAdminDesa from "./pages/admin/dashboard/dashboardDesa";
import DashboardAdminInovasi from "./pages/admin/dashboard/dashboardInovasi";
import DashboardAdminInovator from "./pages/admin/dashboard/dashboardInovator";
import VerificationPage from "./pages/admin/verification/VerificationPage";
import BantuanFAQ from "./pages/bantuanFAQ";
import EmailReset from "./pages/emailreset/EmailReset";
import AddInnovation from "./pages/innovation/add/index";
import DesaYangMenerapkan from "./pages/innovation/desaYangMenerapkan";
import EditInnovation from "./pages/innovation/edit";
import InnovationListPage from "./pages/innovator/detail/ProdukInovasi/InnovationListPage";
import InnovatorForm from "./pages/innovator/form";
import ProfileInnovator from "./pages/innovator/profile";
import PengajuanInovasi from "./pages/innovator/profile/pengajuanInovasi/PengajuanInovasi";
import Notification from "./pages/notification/Notification";
import ResetPassword from "./pages/reset_password/ResetPassword";
import NewPassword from "./pages/resetpassword/newpassword/NewPassword";
import DashboardPerangkatDesa from "./pages/village/dashboard";
import RekomendasiInovasi from "./pages/village/dashboard/rekomendasiDashboard";
import AddVillage from "./pages/village/form";
import KlaimInovasi from "./pages/village/klaimInovasi";
import DetailKlaim from "./pages/village/detailKlaim";
import PengajuanKlaim from "./pages/village/pengajuanKlaim";
import ProfileVillage from "./pages/village/profile";
import { Bounce, ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

const routes = [
  {
    path: paths.LANDING_PAGE,
    element: <Home />,
  },
  {
    path: paths.LOGIN_PAGE,
    element: <Login />,
  },
  {
    path: paths.REGISTER_PAGE,
    element: <Register />,
  },
  {
    path: paths.VILLAGE_PAGE,
    element: <Village />,
  },
  {
    path: paths.INNOVATOR_PROFILE_PAGE,
    element: <ProfileInnovator />,
  },
  {
    path: paths.DETAIL_VILLAGE_PAGE,
    element: <DetailVillage />,
  },
  {
    path: paths.INNOVATOR_PAGE,
    element: <Innovator />,
  },

  {
    path: paths.DETAIL_INNOVATOR_PAGE,
    element: <DetailInnovator />,
  },
  {
    path: paths.INNOVATION_PAGE,
    element: <Innovation />,
  },
  {
    path: paths.ADD_INNOVATION,
    element: <AddInnovation />,
  },
  {
    path: paths.INNOVATION_CATEGORY_PAGE,
    element: <Innovation />,
  },
  {
    path: paths.DETAIL_INNOVATION_PAGE,
    element: <DetailInnovation />,
  },
  {
    path: paths.EDIT_INNOVATION_PAGE,
    element: <EditInnovation />,
  },
  {
    path: paths.VILLAGE_FORM,
    element: <AddVillage />,
  },
  {
    path: paths.INNOVATOR_FORM,
    element: <InnovatorForm />,
  },
  {
    path: paths.RESET_PASSWORD_PAGE,
    element: <ResetPassword />,
  },
  {
    path: paths.VILLAGE_PROFILE_PAGE,
    element: <ProfileVillage />,
  },
  {
    path: paths.EMAIL_RESET_PASSWORD_PAGE,
    element: <EmailReset />,
  },
  {
    path: paths.NEW_PASSWORD_PAGE,
    element: <NewPassword />,
  },
  {
    path: paths.KLAIM_INOVASI_PAGE,
    element: <KlaimInovasi />,
  },
  {
    path: paths.EDIT_KLAIM_INOVASI_PAGE,
    element: <KlaimInovasi />,
  }, 
  {
    path: paths.NEW_PASSWORD_PAGE,
    element: <NewPassword />,
  },
  {
    path: paths.ADMIN_PAGE,
    element: (
      <AdminGuard>
        <AdminPage />
      </AdminGuard>
    ),
  },
  {
    path: paths.VERIFICATION_PAGE,
    element: (
      <AdminGuard>
        <VerificationPage />
      </AdminGuard>
    ),
  },
  {
    path: paths.MAKE_ADS,
    element: (
      <AdminGuard>
        <MakeAds />
      </AdminGuard>
    ),
  },
  {
    path: paths.NOTIFICATION_PAGE,
    element: <Notification title={""} description={""} />,
  },
  {
    path: paths.PRODUK_INOVASI_PAGE,
    element: <InnovationListPage />, // Pastikan komponen ini sesuai
  },
  {
    path: paths.PENGAJUAN_INOVASI_PAGE,
    element: <PengajuanInovasi />,
  },
  {
    path: paths.PENGAJUAN_KLAIM_PAGE,
    element: <PengajuanKlaim />,
  },
  {
    path: paths.BANTUAN_FAQ_PAGE,
    element: <BantuanFAQ />,
  },
  {
    path: paths.DESA_YANG_MENERAPKAN_PAGE,
    element: <DesaYangMenerapkan />,
  },
  {
    path: paths.ADMIN_DASHBOARD,
    element: (
      <AdminGuard>
        <DashboardAdmin />
      </AdminGuard>
    ),
  },
  {
    path: paths.ADMIN_DASHBOARD_DESA,
    element: (
      <AdminGuard>
        <DashboardAdminDesa />
      </AdminGuard>
    ),
  },
  {
    path: paths.ADMIN_DASHBOARD_INOVATOR,
    element: (
      <AdminGuard>
        <DashboardAdminInovator />
      </AdminGuard>
    ),
  },
  {
    path: paths.ADMIN_DASHBOARD_INOVASI,
    element: (
      <AdminGuard>
        <DashboardAdminInovasi />
      </AdminGuard>
    ),
  },
  {
    path: paths.VILLAGE_DASHBOARD,
    element: <DashboardPerangkatDesa />,
  },
  {
    path: paths.VILLAGE_RECOMENDATION,
    element: <RekomendasiInovasi />,
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
          <ToastContainer
            position="top-center"
            autoClose={2000}
            theme="light"
            transition={Bounce}
          />
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
