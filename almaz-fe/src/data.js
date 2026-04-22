export const ROKOK_AWAL = [
  { id: 1, nama: "Marlboro Red", harga_beli: 20000, harga_jual: 22500 },
  { id: 2, nama: "Sampoerna Hijau", harga_beli: 18000, harga_jual: 20000 },
  { id: 3, nama: "Dji Sam Soe", harga_beli: 15000, harga_jual: 17000 },
  { id: 4, nama: "Gudang Garam Merah", harga_beli: 16000, harga_jual: 18000 },
];

export const TOKO_AWAL = [
  { id: 1, nama: "Warung Mak Siti" },
  { id: 2, nama: "Minimarket Sentosa" },
  { id: 3, nama: "Toko Budi Jaya" },
];

export const DISTRIBUSI_AWAL = [
  {
    id: 1,
    tanggal: "2025-04-01",
    toko: "Warung Mak Siti",
    rokok: "Marlboro Red",
    qty: 20,
    harga: 22500,
  },
  {
    id: 2,
    tanggal: "2025-04-02",
    toko: "Minimarket Sentosa",
    rokok: "Sampoerna Hijau",
    qty: 30,
    harga: 20000,
  },
  {
    id: 3,
    tanggal: "2025-04-05",
    toko: "Toko Budi Jaya",
    rokok: "Dji Sam Soe",
    qty: 25,
    harga: 17000,
  },
];

export const RETUR_AWAL = [
  {
    id: 1,
    tanggal: "2025-04-08",
    toko: "Warung Mak Siti",
    rokok: "Marlboro Red",
    qty: 3,
    alasan: "Tidak laku",
  },
  {
    id: 2,
    tanggal: "2025-04-10",
    toko: "Toko Budi Jaya",
    rokok: "Dji Sam Soe",
    qty: 5,
    alasan: "Rusak",
  },
];

export const ALASAN_RETUR = [
  "Tidak laku",
  "Rusak",
  "Kadaluarsa",
  "Permintaan toko",
];

export const PAGE_SIZE = 10;
