Buatkan aplikasi web React single-file untuk management penjualan rokok bernama ALMAZ.

**Tech stack:**
- React 18 + hooks
- Tailwind CSS (core utilities only)
- Recharts (untuk grafik)
- Lucide React (icons)
- Semua dalam 1 file .jsx, tidak perlu backend

**Design:**
- Modern, fresh, clean — seperti Vercel atau Linear
- Font: DM Sans dari Google Fonts
- Warna dominan: hitam (#111) + putih + abu-abu netral
- Card dengan border tipis, sudut rounded, shadow halus
- Tidak ada warna-warna ramai atau gradien berlebihan

**Data dummy (hardcode langsung di file):**

```js
// Rokok
[
  { id: 1, nama: "Marlboro Red", harga_beli: 20000, harga_jual: 22500 },
  { id: 2, nama: "Sampoerna Hijau", harga_beli: 18000, harga_jual: 20000 },
  { id: 3, nama: "Dji Sam Soe", harga_beli: 15000, harga_jual: 17000 },
  { id: 4, nama: "Gudang Garam Merah", harga_beli: 16000, harga_jual: 18000 },
]

// Toko
[
  { id: 1, nama: "Warung Mak Siti" },
  { id: 2, nama: "Minimarket Sentosa" },
  { id: 3, nama: "Toko Budi Jaya" },
]

// Distribusi (barang keluar ke toko)
[
  { id: 1, tanggal: "2025-04-01", toko: "Warung Mak Siti", rokok: "Marlboro Red", qty: 20, harga: 22500 },
  { id: 2, tanggal: "2025-04-02", toko: "Minimarket Sentosa", rokok: "Sampoerna Hijau", qty: 30, harga: 20000 },
  { id: 3, tanggal: "2025-04-05", toko: "Toko Budi Jaya", rokok: "Dji Sam Soe", qty: 25, harga: 17000 },
]

// Retur (barang tidak laku dikembalikan)
[
  { id: 1, tanggal: "2025-04-08", toko: "Warung Mak Siti", rokok: "Marlboro Red", qty: 3, alasan: "Tidak laku" },
  { id: 2, tanggal: "2025-04-10", toko: "Toko Budi Jaya", rokok: "Dji Sam Soe", qty: 5, alasan: "Rusak" },
]
```

**Struktur aplikasi — 3 tab:**

1. **Dashboard**
   - 4 KPI cards: Total Penjualan (Rp), Total Profit (Rp), Jumlah Toko, Total Retur (unit)
   - Profit dihitung otomatis: `qty × (harga_jual - harga_beli)`
   - Line chart: trend profit harian
   - Bar chart: qty distribusi per jenis rokok
   - Tabel 5 transaksi distribusi terakhir

2. **Distribusi**
   - Tabel semua data distribusi dengan kolom: Tanggal, Toko, Rokok, Qty, Harga Satuan, Total, Profit
   - Tombol "Input Distribusi" → buka modal form
   - Form: tanggal, pilih toko (dropdown), pilih rokok (dropdown), qty
   - Harga otomatis terisi dari data rokok yang dipilih
   - Data baru langsung masuk ke tabel (state lokal)

3. **Retur**
   - Tabel semua data retur dengan kolom: Tanggal, Toko, Rokok, Qty, Alasan
   - Tombol "Input Retur" → buka modal form
   - Form: tanggal, pilih toko, pilih rokok, qty, alasan (dropdown: Tidak laku / Rusak / Kadaluarsa / Permintaan toko)
   - Data baru langsung masuk ke tabel (state lokal)

**Format angka:** gunakan `Intl.NumberFormat` dengan locale `id-ID` dan currency `IDR`

**Catatan:**
- Tidak perlu fitur edit atau hapus
- Tidak perlu login
- Tidak perlu backend atau localStorage
- Semua data cukup di React state
- Kode bersih, terorganisir, dan mudah dibaca