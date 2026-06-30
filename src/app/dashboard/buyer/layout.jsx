import { BuyerSidebar } from "../../../../components/dashboard/BuyerSidebar";

export default function BuyerDashboardLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 md:flex-row">
      <BuyerSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
