import './activation-v2.7.1.css';
import { AdminShell } from "../../components/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
