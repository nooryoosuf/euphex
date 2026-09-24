import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Dashboard — EUPHEX",
  description: "Content dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
