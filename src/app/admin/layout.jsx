import AdminLayout from '../../components/admin/AdminLayout';

export const metadata = {
  title: 'FREONIX - Admin Portal',
  description: 'Panel Manajemen FREONIX',
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
