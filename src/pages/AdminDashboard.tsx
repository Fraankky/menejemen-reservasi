/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "MENUNGGU" | "TERKONFIRMASI" | "DITOLAK" | "DIBATALKAN"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReservasi, setSelectedReservasi] = useState<any>(null);

  // 🔐 Cek login dari localStorage (bukan Supabase Auth)
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUsername = localStorage.getItem("adminUsername");

    if (!adminToken) {
      // Belum login → lempar ke halaman login admin
      navigate("/admin/login");
      return;
    }

    setUserId(adminToken);
    setUserEmail(adminUsername || "");
  }, [navigate]);

  // 📊 Ambil data reservasi
  const { data: reservations } = useQuery({
    queryKey: ["admin-reservations", filterStatus, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("reservasi")
        .select(
          `
          *,
          penyewa(*),
          lapangan(*),
          pembayaran(*)
        `
        )
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      if (searchTerm) {
        query = query.or(
          `kode_booking.ilike.%${searchTerm}%,penyewa.nama.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // 📈 Statistik singkat
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const { data: todayReservations } = await supabase
        .from("reservasi")
        .select("*")
        .eq("tanggal", today);

      const { data: pendingReservations } = await supabase
        .from("reservasi")
        .select("*")
        .eq("status", "MENUNGGU");

      return {
        todayCount: todayReservations?.length || 0,
        pendingCount: pendingReservations?.length || 0,
      };
    },
    enabled: !!userId,
  });

  // ✅ Update status reservasi + update status_verifikasi pembayaran
  const updateReservasiMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "MENUNGGU" | "TERKONFIRMASI" | "DITOLAK" | "DIBATALKAN";
    }) => {
      const { error } = await supabase
        .from("reservasi")
        .update({ status })
        .eq("id_reservasi", id);

      if (error) throw error;

      // Kalau dikonfirmasi, set pembayaran jadi VALID
      if (status === "TERKONFIRMASI") {
        const { data: pembayaran } = await supabase
          .from("pembayaran")
          .select("id_pembayaran")
          .eq("id_reservasi", id)
          .single();

        if (pembayaran) {
          await supabase
            .from("pembayaran")
            .update({
              status_verifikasi: "VALID",
            })
            .eq("id_pembayaran", pembayaran.id_pembayaran);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Berhasil",
        description: "Status reservasi berhasil diupdate",
      });
      setSelectedReservasi(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal update status reservasi",
        variant: "destructive",
      });
    },
  });

  // 🚪 Logout versi custom admin (bersihkan localStorage)
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TERKONFIRMASI":
        return <Badge className="bg-success">Terkonfirmasi</Badge>;
      case "MENUNGGU":
        return <Badge className="bg-warning">Menunggu</Badge>;
      case "DITOLAK":
        return <Badge className="bg-destructive">Ditolak</Badge>;
      case "DIBATALKAN":
        return <Badge variant="secondary">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Selamat datang, {userEmail}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Reservasi Hari Ini</p>
            <p className="text-3xl font-bold">{stats?.todayCount || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
            <p className="text-3xl font-bold text-warning">
              {stats?.pendingCount || 0}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Cari kode booking atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as typeof filterStatus)
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                <SelectItem value="TERKONFIRMASI">Terkonfirmasi</SelectItem>
                <SelectItem value="DITOLAK">Ditolak</SelectItem>
                <SelectItem value="DIBATALKAN">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Reservations Table */}
        <Card className="overflow-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">Kode Booking</th>
                  <th className="p-4 text-left">Penyewa</th>
                  <th className="p-4 text-left">Lapangan</th>
                  <th className="p-4 text-left">Tanggal</th>
                  <th className="p-4 text-left">Jam</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reservations?.map((r: any) => (
                  <tr key={r.id_reservasi} className="border-b">
                    <td className="p-4 font-mono font-semibold">
                      {r.kode_booking}
                    </td>
                    <td className="p-4">{r.penyewa?.nama}</td>
                    <td className="p-4">{r.lapangan?.nama}</td>
                    <td className="p-4">
                      {format(new Date(r.tanggal), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </td>
                    <td className="p-4">
                      {r.jam_mulai} - {r.jam_selesai}
                    </td>
                    <td className="p-4">{getStatusBadge(r.status)}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReservasi(r)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedReservasi}
          onOpenChange={() => setSelectedReservasi(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Reservasi</DialogTitle>
            </DialogHeader>

            {selectedReservasi && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Kode Booking
                    </p>
                    <p className="font-mono font-semibold">
                      {selectedReservasi.kode_booking}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedReservasi.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nama Penyewa
                    </p>
                    <p className="font-semibold">
                      {selectedReservasi.penyewa?.nama}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      No. Telepon
                    </p>
                    <p className="font-semibold">
                      {selectedReservasi.penyewa?.no_telepon}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lapangan</p>
                    <p className="font-semibold">
                      {selectedReservasi.lapangan?.nama}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tanggal & Jam
                    </p>
                    <p className="font-semibold">
                      {format(
                        new Date(selectedReservasi.tanggal),
                        "dd MMM yyyy",
                        { locale: id }
                      )}
                      <br />
                      {selectedReservasi.jam_mulai} -{" "}
                      {selectedReservasi.jam_selesai}
                    </p>
                  </div>
                </div>

                {selectedReservasi.pembayaran?.[0] && (
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 font-semibold">Pembayaran</p>
                    <p>
                      Total: Rp{" "}
                      {selectedReservasi.pembayaran[0].jumlah.toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    {selectedReservasi.pembayaran[0].bukti_url && (
                      <div className="mt-2">
                        <a
                          href={selectedReservasi.pembayaran[0].bukti_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Lihat Bukti Pembayaran
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedReservasi.status === "MENUNGGU" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() =>
                        updateReservasiMutation.mutate({
                          id: selectedReservasi.id_reservasi,
                          status: "TERKONFIRMASI",
                        })
                      }
                      disabled={updateReservasiMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Terima
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() =>
                        updateReservasiMutation.mutate({
                          id: selectedReservasi.id_reservasi,
                          status: "DITOLAK",
                        })
                      }
                      disabled={updateReservasiMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
