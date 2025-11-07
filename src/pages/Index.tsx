import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CheckCircle, LogIn, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 min-h-[600px]">
        
        <div className="absolute inset-0 z-0">
          
          <img 
            src="https://images.unsplash.com/photo-1519766304817-4f37bda74a26?q=80&w=2070&auto=format&fit=crop"
            alt="Basketball Court"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-gray-900/80 to-black/85"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleAuthClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Admin Login</span>
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl drop-shadow-2xl">
              Reservasi Lapangan GOR<br />Cepat & Mudah
            </h1>
            <p className="mb-8 text-xl text-white/95 md:text-2xl drop-shadow-lg">
              Booking lapangan olahraga tanpa ribet, tanpa registrasi
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/schedule")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Cek Ketersediaan Sekarang
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white/20 text-lg backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/check-status")}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Cek Status Booking
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Kenapa Pilih Kami?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-success-light">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Booking Cepat</h3>
              <p className="text-muted-foreground">
                Proses reservasi hanya butuh beberapa menit. Tanpa registrasi yang ribet.
              </p>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lokasi Strategis</h3>
              <p className="text-muted-foreground">
                Fasilitas lengkap dengan berbagai jenis lapangan: Futsal, Badminton, Basket, dan Voli.
              </p>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Konfirmasi Real-time</h3>
              <p className="text-muted-foreground">
                Dapatkan kode booking dan konfirmasi langsung setelah pembayaran terverifikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-700 via-gray-800 to-black py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Siap untuk Bermain?</h2>
          <p className="mb-8 text-xl text-gray-400">
            Lihat jadwal dan booking lapangan favoritmu sekarang!
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary text-lg shadow-primary"
            onClick={() => navigate("/schedule")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Lihat Jadwal Lapangan
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;