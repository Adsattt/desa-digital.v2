import { DetailContainer } from "src/pages/innovation/_innovationStyle";

export const paths = {
  LANDING_PAGE: "/",
  LOGIN_PAGE: "/login",
  REGISTER_PAGE: "/register",
  RESET_PASSWORD_PAGE: "/resetpassword",
  EMAIL_RESET_PASSWORD_PAGE: "/emailreset",
  NEW_PASSWORD_PAGE: "/resetpassword/newpassword",
  NOTIFICATION_PAGE: "/notification",
  BANTUAN_FAQ_PAGE: "/bantuanFAQ",

  // ! admin
  ADMIN_PAGE: "/admin",
  VERIFICATION_PAGE: "/admin/verification/:category",
  MAKE_ADS: "/admin/ads/make",
  ADMIN_DASHBOARD:"/admin/dashboard",
  ADMIN_DASHBOARD_DESA: "/admin/dashboard-desa",
  ADMIN_DASHBOARD_INOVASI: "/admin/dashboard-inovasi",
  ADMIN_DASHBOARD_INOVATOR: "/admin/dashboard-inovator",

  // ! village
  VILLAGE_PAGE: "/village",
  VILLAGE_FORM: "/village/form",
  DETAIL_VILLAGE_PAGE: "/village/detail/:id",
  VILLAGE_PROFILE_PAGE: "/village/profile/:id",
  KLAIM_INOVASI_PAGE: "/village/klaimInovasi",
  MANUAL_KLAIM_INOVASI: "/village/klaimInovasi/manual",
  DETAIL_KLAIM_INOVASI_PAGE: "/village/klaimInovasi/detail/:id",
  PENGAJUAN_KLAIM_PAGE: "/village/pengajuan/:id",
  VILLAGE_DASHBOARD: "/village/dashboard",
  VILLAGE_RECOMENDATION: "/village/dashboard/rekomendasi",

  // ! innovator
  INNOVATOR_PAGE: "/innovator",
  INNOVATOR_PROFILE_PAGE: "/innovator/profile/:id",
  DETAIL_INNOVATOR_PAGE: "/innovator/detail/:id",
  INNOVATOR_FORM: "/innovator/form",
  PRODUK_INOVASI_PAGE: "/innovator/detail/ProdukInovasi",
  PENGAJUAN_INOVASI_PAGE: "/innovator/profile/pengajuanInovasi",

  // ! innovation
  INNOVATION_PAGE: "/innovation",
  ADD_INNOVATION: "/innovation/add",
  INNOVATION_DETAIL: "/innovation/detail/:id",
  INNOVATION_CATEGORY_PAGE: "/innovation/:category",
  DETAIL_INNOVATION_PAGE: "/innovation/detail/:id",
  EDIT_INNOVATION_PAGE: "/innovation/edit/:id",
  DESA_YANG_MENERAPKAN_PAGE: "/innovation/desaYangMenerapkan/:id",
};
