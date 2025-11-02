import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle, Clock, XCircle, Ban } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const CheckStatus = () => {
  const navigate = useNavigate();
  const [kodeBooking, setKodeBooking] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reservasi, isLoading } = useQuery({
    queryKey: ["reservasi-status", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
      
      const { data, error } = await supabase
        .from("reservasi")
        .select(`
          *,
          penyewa(*),
          lapangan(*),
          pembayaran(*)
        `)
        .eq("kode_booking", searchQuery.toUpperCase())
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(kodeBooking);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TERKONFIRMASI":
        return <Badge className="bg-success"><CheckCircle className="mr-1 h-3 w-3" /> Terkonfirmasi</Badge>;
      case "MENUNGGU":
        return <Badge className="bg-warning"><Clock className="mr-1 h-3 w-3" /> Menunggu Verifikasi</Badge>;
      case "DITOLAK":
        return <Badge className="bg-destructive"><XCircle className="mr-1 h-3 w-3" /> Ditolak</Badge>;
      case "DIBATALKAN":
        return <Badge variant="secondary"><Ban className="mr-1 h-3 w-3" /> Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>

        <h1 className="mb-8 text-4xl font-bold">Cek Status Reservasi</h1>

        <Card className="mb-8 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="kode">Masukkan Kode Booking</Label>
              <div className="flex gap-2">
                <Input
                  id="kode"
                  value={kodeBooking}
                  onChange={(e) => setKodeBooking(e.target.value.toUpperCase())}
                  placeholder="Contoh: ABC12345"
                  className="flex-1"
                  maxLength={12}
                />
                <Button type="submit" disabled={!kodeBooking || isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  Cari
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {searchQuery && reservasi && (
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detail Reservasi</h2>
              {getStatusBadge(reservasi.status)}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Kode Booking</p>
                  <p className="font-mono text-lg font-semibold">{reservasi.kode_booking}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nama Pemesan</p>
                  <p className="font-semibold">{reservasi.penyewa.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. Telepon</p>
                  <p className="font-semibold">{reservasi.penyewa.no_telepon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lapangan</p>
                  <p className="font-semibold">{reservasi.lapangan.nama}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="mb-2 font-semibold">Jadwal:</p>
                <p className="text-lg">
                  {format(new Date(reservasi.tanggal), "EEEE, dd MMMM yyyy", { locale: id })}
                </p>
                <p className="text-lg">
                  {reservasi.jam_mulai} - {reservasi.jam_selesai} WIB
                </p>
              </div>

              {reservasi.pembayaran && reservasi.pembayaran[0] && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="mb-2 font-semibold">Pembayaran:</p>
                  <p className="text-lg">
                    Total: <span className="font-semibold">Rp {reservasi.pembayaran[0].jumlah.toLocaleString("id-ID")}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {reservasi.pembayaran[0].status_verifikasi}
                  </p>
                </div>
              )}

              {reservasi.status === "TERKONFIRMASI" && (
                <Button className="w-full" size="lg">
                  Cetak Bukti Reservasi
                </Button>
              )}

              {reservasi.status === "MENUNGGU" && (
                <div className="rounded-lg bg-warning-light p-4 text-center">
                  <p className="text-sm">
                    Reservasi Anda sedang dalam proses verifikasi. Silakan tunggu konfirmasi dari admin.
                  </p>
                </div>
              )}

              {reservasi.status === "DITOLAK" && (
                <div className="rounded-lg bg-destructive-light p-4 text-center">
                  <p className="text-sm">
                    Reservasi Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {searchQuery && !reservasi && !isLoading && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Tidak ada reservasi dengan kode booking tersebut.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckStatus;
