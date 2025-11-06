import { useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import { z } from "zod";

const bookingSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  no_telepon: z.string().min(10, "Nomor telepon minimal 10 digit").max(20),
  id_lapangan: z.string().uuid("Pilih lapangan"),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
});

const Book = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [bookingCode, setBookingCode] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    no_telepon: "",
    id_lapangan: searchParams.get("lapangan") || "",
    tanggal: searchParams.get("tanggal") || "",
    jam_mulai: searchParams.get("jam") || "",
    jam_selesai: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { data: lapangan } = useQuery({
    queryKey: ["lapangan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lapangan")
        .select("*")
        .eq("status_aktif", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: tarif } = useQuery({
    queryKey: ["tarif", formData.id_lapangan],
    queryFn: async () => {
      if (!formData.id_lapangan) return null;
      const { data, error } = await supabase
        .from("tarif")
        .select("*")
        .eq("id_lapangan", formData.id_lapangan)
        .lte("mulai_berlaku", formData.tanggal)
        .or(`akhir_berlaku.is.null,akhir_berlaku.gte.${formData.tanggal}`)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!formData.id_lapangan && !!formData.tanggal,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validate
      const validated = bookingSchema.parse(data);
      
      // Check conflicts
      const { data: conflicts } = await supabase
        .from("reservasi")
        .select("*")
        .eq("id_lapangan", validated.id_lapangan)
        .eq("tanggal", validated.tanggal)
        .in("status", ["MENUNGGU", "TERKONFIRMASI"])
        .or(`and(jam_mulai.lt.${validated.jam_selesai},jam_selesai.gt.${validated.jam_mulai})`);
      
      if (conflicts && conflicts.length > 0) {
        throw new Error("Slot waktu sudah dipesan");
      }

      // Create penyewa
      const { data: penyewa, error: penyewaError } = await supabase
        .from("penyewa")
        .insert({ nama: validated.nama, no_telepon: validated.no_telepon })
        .select()
        .single();
      
      if (penyewaError) throw penyewaError;

      // Generate booking code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Create reservasi
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi")
        .insert({
          id_penyewa: penyewa.id_penyewa,
          id_lapangan: validated.id_lapangan,
          tanggal: validated.tanggal,
          jam_mulai: validated.jam_mulai,
          jam_selesai: validated.jam_selesai,
          kode_booking: code,
        })
        .select()
        .single();
      
      if (reservasiError) throw reservasiError;

      return { reservasi, code };
    },
    onSuccess: ({ code }) => {
      setBookingCode(code);
      setStep(2);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!uploadedFile || !bookingCode) return;

      // Upload file to storage
      const fileExt = uploadedFile.name.split(".").pop();
      const fileName = `${bookingCode}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, uploadedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      // Get reservasi
      const { data: reservasi } = await supabase
        .from("reservasi")
        .select("id_reservasi")
        .eq("kode_booking", bookingCode)
        .single();

      if (!reservasi) throw new Error("Reservasi tidak ditemukan");

      // Calculate hours
      const start = parseInt(formData.jam_mulai.split(":")[0]);
      const end = parseInt(formData.jam_selesai.split(":")[0]);
      const hours = end - start;
      const jumlah = (tarif?.harga_per_jam || 0) * hours;

      // Create pembayaran
      const { error: pembayaranError } = await supabase
        .from("pembayaran")
        .insert({
          id_reservasi: reservasi.id_reservasi,
          metode: "transfer",
          jumlah,
          bukti_url: urlData.publicUrl,
          status_verifikasi: "MENUNGGU",
        });

      if (pembayaranError) throw pembayaranError;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Bukti pembayaran berhasil diunggah",
      });
      setTimeout(() => navigate("/check-status"), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBookingMutation.mutate(formData);
  };

  const handleUpload = () => {
    uploadPaymentMutation.mutate();
  };

  const calculateTotal = () => {
    if (!tarif || !formData.jam_mulai || !formData.jam_selesai) return 0;
    const start = parseInt(formData.jam_mulai.split(":")[0]);
    const end = parseInt(formData.jam_selesai.split(":")[0]);
    const hours = end - start;
    return tarif.harga_per_jam * hours;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <h1 className="mb-8 text-4xl font-bold">Buat Reservasi</h1>

        {step === 1 ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="no_telepon">Nomor Telepon (WhatsApp) *</Label>
                <Input
                  id="no_telepon"
                  type="tel"
                  value={formData.no_telepon}
                  onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="lapangan">Jenis Lapangan *</Label>
                <Select
                  value={formData.id_lapangan}
                  onValueChange={(value) => setFormData({ ...formData, id_lapangan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Lapangan" />
                  </SelectTrigger>
                  <SelectContent>
                    {lapangan?.map((l) => (
                      <SelectItem key={l.id_lapangan} value={l.id_lapangan}>
                        {l.nama} - {l.jenis}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tanggal">Tanggal *</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jam_mulai">Jam Mulai *</Label>
                  <Input
                    id="jam_mulai"
                    type="time"
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jam_selesai">Jam Selesai *</Label>
                  <Input
                    id="jam_selesai"
                    type="time"
                    value={formData.jam_selesai}
                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                    required
                  />
                </div>
              </div>

              {tarif && formData.jam_mulai && formData.jam_selesai && (
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Pembayaran:</span>
                    <span className="text-primary">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? "Memproses..." : "Lanjut ke Pembayaran"}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="mb-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
              <h2 className="mb-2 text-2xl font-bold">Reservasi Berhasil!</h2>
              <p className="text-muted-foreground">Kode Booking Anda:</p>
              <div className="mt-2 text-3xl font-bold text-primary">{bookingCode}</div>
            </div>

            <div className="mb-6 space-y-4">
              <h3 className="font-semibold">Instruksi Pembayaran:</h3>
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="mb-2">Transfer ke rekening:</p>
                <p className="font-mono font-semibold">Bank BCA: 1234567890</p>
                <p className="font-mono font-semibold">a/n GOR Management</p>
                <p className="mt-2">Jumlah: <span className="font-semibold">Rp {calculateTotal().toLocaleString("id-ID")}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Upload Bukti Pembayaran</Label>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
                {uploadedFile && (
                  <p className="text-sm text-muted-foreground">
                    File: {uploadedFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                className="w-full"
                size="lg"
                disabled={!uploadedFile || uploadPaymentMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadPaymentMutation.isPending ? "Mengunggah..." : "Upload Bukti Pembayaran"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Simpan kode booking Anda untuk cek status
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Book;
