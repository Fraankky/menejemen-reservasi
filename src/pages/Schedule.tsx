import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import * as React from "react";

const Schedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLapangan, setSelectedLapangan] = useState<string>("all");

  // Fetch lapangan
  const { data: lapangan } = useQuery({
    queryKey: ["lapangan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lapangan")
        .select("*")
        .eq("status_aktif", true)
        .order("nama");
      if (error) throw error;
      return data;
    },
  });

  // Fetch reservations for selected date
  const { data: reservations } = useQuery({
    queryKey: ["reservations", selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("reservasi")
        .select("*, lapangan(*)")
        .eq("tanggal", dateStr)
        .in("status", ["MENUNGGU", "TERKONFIRMASI"]);
      if (error) throw error;
      return data;
    },
  });

  // Fetch blocked schedules
  const { data: jadwal } = useQuery({
    queryKey: ["jadwal", selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("jadwal")
        .select("*, lapangan(*)")
        .eq("tanggal", dateStr);
      if (error) throw error;
      return data;
    },
  });

  const timeSlots = Array.from({ length: 15 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

  // Pastikan tipe sama saat filter (id number vs string)
  const filteredLapangan =
    selectedLapangan === "all"
      ? lapangan
      : lapangan?.filter((l: any) => String(l.id_lapangan) === String(selectedLapangan));

  const isSlotAvailable = (lapanganId: string, time: string) => {
    const hasReservation = reservations?.some(
      (r: any) => String(r.id_lapangan) === String(lapanganId) && r.jam_mulai <= time && r.jam_selesai > time
    );
    const isBlocked = jadwal?.some(
      (j: any) => String(j.id_lapangan) === String(lapanganId) && j.jam_mulai <= time && j.jam_selesai > time
    );
    return !hasReservation && !isBlocked;
  };

  const getSlotStatus = (lapanganId: string, time: string) => {
    const blocked = jadwal?.find(
      (j: any) => String(j.id_lapangan) === String(lapanganId) && j.jam_mulai <= time && j.jam_selesai > time
    );
    if (blocked) {
      return {
        status: blocked.tipe_blokir,
        label: blocked.tipe_blokir === "maintenance" ? "Maintenance" : "Event",
      };
    }
    const reserved = reservations?.find(
      (r: any) => String(r.id_lapangan) === String(lapanganId) && r.jam_mulai <= time && r.jam_selesai > time
    );
    if (reserved) return { status: "booked", label: "Terpesan" };
    return { status: "available", label: "Tersedia" };
  };

  const handleSlotClick = (lapanganId: string, time: string) => {
    if (isSlotAvailable(lapanganId, time)) {
      navigate(`/book?lapangan=${lapanganId}&tanggal=${format(selectedDate, "yyyy-MM-dd")}&jam=${time}`);
    }
  };

  // === 👉 Perbaikan utama tabel: kolom grid mengikuti jumlah lapangan ===
  const columnCount = filteredLapangan?.length ?? 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>

        <h1 className="mb-8 text-4xl font-bold">Jadwal & Ketersediaan Lapangan</h1>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-4">
              <Label className="mb-2 block font-semibold">Pilih Tanggal</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={id}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-4">
              <Label className="mb-2 block font-semibold">Filter Lapangan</Label>
              <Select value={selectedLapangan} onValueChange={setSelectedLapangan}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Lapangan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lapangan</SelectItem>
                  {lapangan?.map((l: any) => (
                    <SelectItem key={l.id_lapangan} value={String(l.id_lapangan)}>
                      {l.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-4">
              <Label className="mb-2 block font-semibold">Keterangan</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-success" />
                  <span>Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-destructive" />
                  <span>Terpesan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span>Maintenance/Event</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Schedule Grid */}
          <Card className="overflow-auto p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })}
            </h2>

            <div
              className="grid gap-2 min-w-[720px]"
              style={{
                // 1 kolom untuk "Jam" + N kolom lapangan
                gridTemplateColumns: `120px repeat(${columnCount}, minmax(120px, 1fr))`,
              }}
            >
              {/* Header */}
              <div className="font-semibold sticky left-0 bg-card z-10">Jam</div>
              {filteredLapangan?.map((l: any) => (
                <div key={`head-${l.id_lapangan}`} className="text-center font-semibold text-sm">
                  {l.nama}
                </div>
              ))}

              {/* Rows */}
              {timeSlots.map((time) => (
                <React.Fragment key={`row-${time}`}>
                  {/* Kolom waktu (sticky) */}
                  <div className="flex items-center font-medium sticky left-0 bg-card z-10">{time}</div>

                  {/* Kolom status per lapangan */}
                  {filteredLapangan?.map((l: any) => {
                    const slot = getSlotStatus(String(l.id_lapangan), time);
                    const available = slot.status === "available";
                    return (
                      <Button
                        key={`${l.id_lapangan}-${time}`}
                        variant={available ? "default" : "secondary"}
                        className={`h-16 text-xs ${
                          available
                            ? "bg-success hover:bg-success/90"
                            : slot.status === "booked"
                            ? "bg-destructive hover:bg-destructive/90 cursor-not-allowed"
                            : "bg-muted hover:bg-muted cursor-not-allowed"
                        }`}
                        onClick={() => handleSlotClick(String(l.id_lapangan), time)}
                        disabled={!available}
                      >
                        {slot.label}
                      </Button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
