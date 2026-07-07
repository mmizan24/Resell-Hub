import { AdminSidebar } from "../../../../components/dashboard/AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 md:flex-row">
      <AdminSidebar />

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}