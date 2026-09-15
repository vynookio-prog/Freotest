import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1F2937] font-sans antialiased selection:bg-[#DDA15E] selection:text-white flex flex-col relative overflow-x-hidden">
      {/* High-performance GPU-friendly ambient background (no heavy blur repaints) */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_60%_50%_at_15%_10%,rgba(221,161,94,0.22),transparent_70%),radial-gradient(ellipse_60%_50%_at_85%_45%,rgba(139,87,66,0.14),transparent_70%),radial-gradient(ellipse_60%_50%_at_30%_95%,rgba(221,161,94,0.18),transparent_70%)]" 
      />

      <Navbar />
      <main className="flex-grow pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
}
