import AdminQuickLinks from "../components/AdminQuickLinks";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminQuickLinks />
      {children}
    </>
  );
}