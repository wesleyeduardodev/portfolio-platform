import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-0 md:ml-64 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
