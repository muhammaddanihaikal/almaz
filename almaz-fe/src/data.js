export const ROKOK_AWAL = [
  { id: 1, nama: "Marlboro Red",       harga_beli: 20000, harga_jual: 22500, stok: 100 },
  { id: 2, nama: "Sampoerna Hijau",    harga_beli: 18000, harga_jual: 20000, stok: 150 },
  { id: 3, nama: "Dji Sam Soe",        harga_beli: 15000, harga_jual: 17000, stok: 200 },
  { id: 4, nama: "Gudang Garam Merah", harga_beli: 16000, harga_jual: 18000, stok: 80  },
];

export const TOKO_AWAL = [
  { id: 1, nama: "Warung Mak Siti",    alamat: "Jl. Mawar No. 12, Bandung" },
  { id: 2, nama: "Minimarket Sentosa", alamat: "Jl. Sudirman No. 45, Bandung" },
  { id: 3, nama: "Toko Budi Jaya",     alamat: "Jl. Merdeka No. 7, Bandung" },
];

export const DISTRIBUSI_AWAL = [
  {
    id: 1, tanggal: "2026-04-01", toko: "Warung Mak Siti",
    items: [
      { rokok: "Marlboro Red",    qty: 20, harga: 22500 },
      { rokok: "Sampoerna Hijau", qty: 15, harga: 20000 },
    ],
  },
  {
    id: 2, tanggal: "2026-04-02", toko: "Minimarket Sentosa",
    items: [
      { rokok: "Dji Sam Soe", qty: 30, harga: 17000 },
    ],
  },
  {
    id: 3, tanggal: "2026-04-03", toko: "Toko Budi Jaya",
    items: [
      { rokok: "Gudang Garam Merah", qty: 25, harga: 18000 },
      { rokok: "Marlboro Red",       qty: 10, harga: 22500 },
      { rokok: "Sampoerna Hijau",    qty: 20, harga: 20000 },
    ],
  },
  {
    id: 4, tanggal: "2026-04-05", toko: "Warung Mak Siti",
    items: [
      { rokok: "Dji Sam Soe",        qty: 18, harga: 17000 },
      { rokok: "Gudang Garam Merah", qty: 12, harga: 18000 },
    ],
  },
  {
    id: 5, tanggal: "2026-04-07", toko: "Minimarket Sentosa",
    items: [
      { rokok: "Marlboro Red", qty: 15, harga: 22500 },
    ],
  },
  {
    id: 6, tanggal: "2026-04-09", toko: "Toko Budi Jaya",
    items: [
      { rokok: "Sampoerna Hijau", qty: 22, harga: 20000 },
      { rokok: "Dji Sam Soe",    qty: 16, harga: 17000 },
    ],
  },
  {
    id: 7, tanggal: "2026-04-11", toko: "Warung Mak Siti",
    items: [
      { rokok: "Marlboro Red",       qty: 25, harga: 22500 },
      { rokok: "Gudang Garam Merah", qty: 14, harga: 18000 },
    ],
  },
  {
    id: 8, tanggal: "2026-04-13", toko: "Minimarket Sentosa",
    items: [
      { rokok: "Sampoerna Hijau", qty: 28, harga: 20000 },
    ],
  },
  {
    id: 9, tanggal: "2026-04-15", toko: "Toko Budi Jaya",
    items: [
      { rokok: "Dji Sam Soe",        qty: 20, harga: 17000 },
      { rokok: "Marlboro Red",       qty: 12, harga: 22500 },
      { rokok: "Gudang Garam Merah", qty:  8, harga: 18000 },
    ],
  },
  {
    id: 10, tanggal: "2026-04-17", toko: "Warung Mak Siti",
    items: [
      { rokok: "Sampoerna Hijau", qty: 35, harga: 20000 },
      { rokok: "Dji Sam Soe",    qty: 10, harga: 17000 },
    ],
  },
  {
    id: 11, tanggal: "2026-04-19", toko: "Minimarket Sentosa",
    items: [
      { rokok: "Marlboro Red",       qty: 18, harga: 22500 },
      { rokok: "Gudang Garam Merah", qty: 22, harga: 18000 },
    ],
  },
  {
    id: 12, tanggal: "2026-04-21", toko: "Toko Budi Jaya",
    items: [
      { rokok: "Sampoerna Hijau", qty: 25, harga: 20000 },
    ],
  },
];

export const RETUR_AWAL = [
  {
    id: 1, tanggal: "2026-04-04", toko: "Warung Mak Siti", alasan: "Tidak laku",
    items: [
      { rokok: "Marlboro Red",    qty: 3 },
      { rokok: "Sampoerna Hijau", qty: 2 },
    ],
  },
  {
    id: 2, tanggal: "2026-04-06", toko: "Minimarket Sentosa", alasan: "Tidak laku",
    items: [
      { rokok: "Dji Sam Soe", qty: 4 },
    ],
  },
  {
    id: 3, tanggal: "2026-04-08", toko: "Toko Budi Jaya", alasan: "Kadaluarsa",
    items: [
      { rokok: "Gudang Garam Merah", qty: 2 },
      { rokok: "Marlboro Red",       qty: 1 },
    ],
  },
  {
    id: 4, tanggal: "2026-04-10", toko: "Warung Mak Siti", alasan: "Tidak laku",
    items: [
      { rokok: "Sampoerna Hijau", qty: 5 },
    ],
  },
  {
    id: 5, tanggal: "2026-04-12", toko: "Minimarket Sentosa", alasan: "Rusak",
    items: [
      { rokok: "Dji Sam Soe",  qty: 3 },
      { rokok: "Marlboro Red", qty: 2 },
    ],
  },
  {
    id: 6, tanggal: "2026-04-14", toko: "Toko Budi Jaya", alasan: "Tidak laku",
    items: [
      { rokok: "Gudang Garam Merah", qty: 4 },
    ],
  },
  {
    id: 7, tanggal: "2026-04-16", toko: "Warung Mak Siti", alasan: "Rusak",
    items: [
      { rokok: "Marlboro Red",    qty: 3 },
      { rokok: "Sampoerna Hijau", qty: 6 },
    ],
  },
  {
    id: 8, tanggal: "2026-04-18", toko: "Minimarket Sentosa", alasan: "Kadaluarsa",
    items: [
      { rokok: "Dji Sam Soe", qty: 2 },
    ],
  },
  {
    id: 9, tanggal: "2026-04-20", toko: "Toko Budi Jaya", alasan: "Permintaan toko",
    items: [
      { rokok: "Gudang Garam Merah", qty: 3 },
      { rokok: "Marlboro Red",       qty: 4 },
      { rokok: "Sampoerna Hijau",    qty: 2 },
    ],
  },
  {
    id: 10, tanggal: "2026-04-22", toko: "Warung Mak Siti", alasan: "Tidak laku",
    items: [
      { rokok: "Dji Sam Soe", qty: 5 },
    ],
  },
  {
    id: 11, tanggal: "2026-04-22", toko: "Minimarket Sentosa", alasan: "",
    items: [
      { rokok: "Sampoerna Hijau",    qty: 3 },
      { rokok: "Gudang Garam Merah", qty: 1 },
    ],
  },
];

export const PAGE_SIZE = 10;
