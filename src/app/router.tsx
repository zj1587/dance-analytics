import { createBrowserRouter, Navigate } from "react-router-dom";
import { appConfig } from "./appConfig";
import { AccessPage } from "../pages/AccessPage";
import { AppShell } from "../layouts/AppShell";
import { MasterDataPage } from "../pages/MasterDataPage";
import { ClassHourRecordPage } from "../pages/ClassHourRecordPage";
import { AnalysisPage } from "../pages/AnalysisPage";

export const router = createBrowserRouter([
  { path: "/access", element: <AccessPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to={appConfig.defaultRoute} replace /> },
      { path: "master-data", element: <MasterDataPage /> },
      { path: "class-hour-record", element: <ClassHourRecordPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "*", element: <Navigate to={appConfig.defaultRoute} replace /> },
    ],
  },
]);

