import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
}