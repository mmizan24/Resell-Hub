import { BuyerSidebar } from "../../../../components/dashboard/BuyerSidebar";

export default function BuyerDashboardLayout({ children }) {
  return (
    <div className="flex flex-1 justify-center bg-slate-50">
      <div className="flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <BuyerSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
