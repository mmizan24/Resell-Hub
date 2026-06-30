import { DashboardSidebar } from "../../../../components/dashboard/DashboardSidebar";

export default function SellerDashboardLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 md:flex-row">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
