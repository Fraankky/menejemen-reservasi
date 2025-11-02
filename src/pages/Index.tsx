import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-700 via-gray-800 to-black py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              Reservasi Lapangan GOR<br />Cepat & Mudah
            </h1>
            <p className="mb-8 text-xl text-white/90 md:text-2xl">
              Booking lapangan olahraga tanpa ribet, tanpa registrasi
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent-hover text-lg shadow-lg"
                onClick={() => navigate("/schedule")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Cek Ketersediaan Sekarang
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white/20 text-lg backdrop-blur-sm"
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
      <section className="bg-gradient-to-br from-gray-700 via-gray-800 to-black py-16 px-4 ">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Siap untuk Bermain?</h2>
          <p className="mb-8 text-xl text-muted-foreground text-gray-40">
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
