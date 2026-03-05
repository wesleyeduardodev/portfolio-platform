import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/Toaster";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="ml-0 md:ml-64 p-4 sm:p-6 md:p-8">{children}</main>
      <Toaster />
    </div>
  );
}
