# Laporan Fitur & Pembaruan — LUMA: Floating Worlds

**Tanggal Laporan:** 16 November 2026  
**Proyek:** LUMA: Floating Worlds  
**Arsitektur:** Frontend-only SPA (React 19 + TypeScript + Three.js / React Three Fiber + Tailwind CSS v4 + LocalStorage)

---

## 1. Ringkasan Eksekutif

Dokumen ini merangkum seluruh fitur inti, arsitektur teknis, serta pembaruan ekspansi konten yang telah diimplementasikan pada **LUMA: Floating Worlds**. Pembaruan utama memperluas kampanye dari **3 level awal menjadi 10 level lengkap (*handcrafted*)**, menambahkan mekanik puzzle lanjutan (*sub-crystal resonator*, *inverted twin gates*, *switch-linked lifts*, *water pond obstacles*), aset 3D lingkungan baru, peningkatan antarmuka UI untuk 10 pulau, serta pengujian otomatis untuk seluruh level.

---

## 2. Arsitektur & Teknologi Inti

| Komponen | Implementasi | Lokasi File |
| :--- | :--- | :--- |
| **Framework UI** | React 19 + TypeScript + Tailwind CSS v4 | `src/App.tsx`, `src/index.css` |
| **3D Engine** | Three.js (`^0.187.0`), `@react-three/fiber` (`^9.8.2`), `@react-three/drei` (`^10.7.9`) | `src/three/GameScene.tsx` |
| **Kamera & Rendering** | Isometric Orthographic Camera, ACES Filmic Tone Mapping, `RoomEnvironment` PMREM, Software WebGL (`afterDraw()`) pacing | `src/three/GameScene.tsx`, `src/three/materials.ts` |
| **Logika Puzzle & Fisika** | Pure decoupled game state, grid walkability, stair traversal, collision, 3-pass light propagation | `src/game/rules.ts`, `src/game/types.ts` |
| **Desain Level (10 Pulau)** | 10 level handcrafted dengan tile grid, mekanisme, dan koordinat kamera khusus | `src/game/levels.ts` |
| **Audio Prosedural** | Web Audio API synthesizer tanpa file eksternal (footstep, switch, rotate, lift, prism, crystal, portal, UI click) | `src/audio/synth.ts` |
| **Penyimpanan Progres** | LocalStorage (`luma_floating_worlds_save_v1`) dengan sanitasi data & migrasi backward-compatible | `src/game/progression.ts` |
| **Unit Testing** | Node built-in test runner (`node:test`) + BFS reachability & solution simulation | `src/game/rules.test.ts` |

---

## 3. Fitur Gameplay & Mekanik Utama

### 3.1 Karakter Utama — *The Wayfinder* (`src/three/assets/WayfinderModel.tsx`)
- Model komposit multi-bagian bergaya *low-poly*: jubah saffron (*LatheGeometry*), tunik dalam teal, syal krem, tudung kepala, ransel kulit dengan gulungan alas tidur (*bedroll*), sepatu bot, serta lentera kuningan bercahaya.
- Animasi prosedural yang tersinkronisasi dengan status pergerakan:
  - *Idle breathing bob* dan ayunan lengan halus.
  - *Walking gait*: langkah kaki bergantian, *squash-and-stretch*, serta interpolasi rotasi arah hadap (*smooth yaw damping*).
  - *Interaction bow*: animasi menunduk dan mengangkat lentera saat berinteraksi dengan mekanisme.
  - *Contact shadow* radial di bawah kaki untuk kejelasan posisi pada permukaan elevasi.

### 3.2 Empat Mekanik Puzzle Inti (`src/game/rules.ts`, `src/three/assets/PuzzleMechanisms.tsx`)
1. **Pressure Switches & Gates (`PressureSwitchDef`, `GateDef`)**
   - Mendukung mode *latch* (otomatis aktif saat diinjak) dan mode *toggle* (diaktifkan/dimatikan berulang dengan tombol interaksi `E` / `Space`).
   - Mendukung polaritas terbalik (**`inverted`**) sehingga satu switch dapat membuka satu gerbang sekaligus menutup gerbang lainnya.
   - Mendukung gerbang yang terhubung ke *Sub-Crystal Resonator* (`linkedSubCrystalId`).
   - Indikator visual **Rune Conduit** di lantai yang menghubungkan switch dan gerbang pada elevasi yang sama.
2. **Rotating Platforms (`RotatingPlatformDef`)**
   - Jembatan batu berputar 90° per interaksi melalui engkol kuningan (*crank pedestal*), dengan animasi *damping* yang halus serta kalkulasi rotasi tile secara dinamis.
3. **Elevation Platforms (`ElevationPlatformDef`)**
   - Platform lift batu dengan inti kristal bercahaya dan 4 rel kuningan pemandu (*guide rails*) yang tingginya menyesuaikan rentang elevasi.
   - Mendukung lift manual maupun lift yang terhubung otomatis dengan switch (`linkedSwitchId`).
4. **Light Emitters, Prisms & Crystals (`LightEmitterDef`, `LightPrismDef`, `SubCrystalDef`, `CrystalDef`)**
   - Pemancar cahaya menembakkan sinar energi secara ortogonal dan memantul melalui prisma yang dapat diputar ke 4 arah mata angin.
   - Sinar cahaya dapat terhalang oleh gerbang tertutup (`blocksLight`), dinding elevasi lebih tinggi, tile penghalang cahaya, atau berhenti setelah melewati kekosongan (*void*).
   - **Fixed-point 3-pass light propagation** memungkinkan penyalaan *Sub-Crystal Resonator* langsung membuka gerbang penghalang sinar atau jalan di langkah yang sama.

### 3.3 Kontrol & Antarmuka Pengguna (`src/ui/`)
- **Kontrol Permainan:**
  - `WASD` / `Arrow Keys`: Gerak isometrik sejajar layar (`ScreenUp = (-1, -1)`, `ScreenRight = (+1, -1)`).
  - `E` / `Space`: Interaksi kontekstual dengan mekanisme terdekat (disertai penanda 3D melayang di atas objek target dan prompt di HUD).
  - `Mouse Wheel`: Zoom kamera dinamis.
  - `R`: Restart level instan · `M`: Mute/Unmute audio · `Esc` / `P`: Pause.
- **Layar & Modal:**
  - **Title Screen (`TitleScreen.tsx`)**: Lockup emblem `LUMA: Floating Worlds`, tombol `Begin Journey` / `Continue Journey`, akses ke `Islands` dan `Settings`.
  - **HUD (`GameHud.tsx`)**: Panel objektif dinamis (berubah otomatis setelah kristal pulih), timer, penghitung aksi (`ACT`), tombol utilitas cepat, dan prompt interaksi.
  - **Atlas / Level Select (`LevelSelectModal`)**: Menampilkan progres `X / 10 Restored`, daftar scrollable seluruh 10 level, status *Locked / Enter / Best Time*, dan penanda level aktif.
  - **Victory Modal (`VictoryModal`)**: Menampilkan waktu penyelesaian, jumlah aksi, tombol lanjut ke pulau berikutnya (atau ulangi dari awal pada Level 10), tombol `Replay`, `Islands`, dan `Title`.
  - **Pause & Settings (`PauseModal`, `SettingsModal`)**: Pengaturan Sound Effects, Volume, Camera Zoom Offset, serta Reset Saved Progress.

---

## 4. Pembaruan Ekspansi Konten (Dari 3 Menjadi 10 Level)

### 4.1 Daftar Lengkap 10 Level (`src/game/levels.ts`)

| Level | Judul & Subjudul | Mekanik Utama & Fokus Puzzle |
| :---: | :--- | :--- |
| **01** | **The Awakening** · *Dawn Meadow* | Pengenalan gerak, *latch pressure switch*, gerbang jembatan, pemulihan kristal, dan portal. |
| **02** | **The Broken Bridge** · *Shattered Causeway* | Pengenalan *rotating bridges*, lift elevasi, dan koordinasi gerbang lintas pulau. |
| **03** | **The Lightkeeper** · *Sky Observatory* | Pengenalan pemancar cahaya, 3 prisma arah, pembukaan shutter gate, dan aktivasi kristal via sinar cahaya. |
| **04** | **The Ascension** · *Vertical Ruins* | Arsitektur vertikal multi-tingkat (elevasi 0 hingga 3), dua lift berurutan, gerbang teras, tangga batu, dan puncak kristal. |
| **05** | **The Forgotten Garden** · *Overgrown Sanctuary* | Taman terbengkalai dengan kolam air (`water` + `pond_lily`), dua *rotating bridges*, dan *toggle switch* pengatur dua gerbang berlawanan (*twin inverted gates*). |
| **06** | **The Crystal Maze** · *Prismatic Nexus* | Puzzle optik lanjutan dengan 2 sumber cahaya, 4 prisma, dan *Resonator Sub-Crystal* untuk membuka gerbang jalur sinar kedua. |
| **07** | **The Shattered Realm** · *Four-Isle Convergence* | Kepulauan 4 pulau terpisah yang memadukan dua *rotating bridges*, dua lift, gerbang spire, dan penyaluran sinar melintasi celah langit. |
| **08** | **The Skyforge** · *Celestial Foundry* | Pabrik langit dengan dekorasi roda gigi berputar (`forge_gear`), lift-jembatan terhubung switch (`linkedSwitchId`), lift manual, dua jembatan putar, dan gerbang inti anvil. |
| **09** | **The Celestial Observatory** · *Starlight Lens* | Observatorium langit dengan *celestial orrery*, jembatan putar, gerbang shutter, 4 prisma pembelok sinar melintasi jurang ke kristal, dan lift menuju galeri teleskop. |
| **10** | **The Eternal Light** · *Central Sanctuary* | Puncak perjalanan 3 tahap yang menggabungkan keempat mekanik: jembatan putar, switch courtyard, resonator sub-crystal pembuka gerbang atas, lift elevasi, dua prisma suaka, dan **Eternal Crystal** dengan pilar cahaya vertikal ke langit. |

---

## 5. Pembaruan Visual, Aset 3D & Bugfix Teknis

### 5.1 Aset Lingkungan & Terrain Baru
- **Water Pond Basin (`src/three/assets/IslandTerrain.tsx`)**:
  - Tipe terrain `'water'` dirender sebagai kolam batu cekung dengan bingkai batu sandstone, permukaan air semi-transparan (`palette.waterRibbon`), dan sifat *non-walkable* pada logika tumbukan (`getSurfaceAtTile`).
- **3 Properti Komposit Baru (`src/three/assets/EnvironmentProps.tsx`)**:
  - `pond_lily`: Daun teratai bertingkat dengan bunga teratai (*lotus blossom*) yang mengapung dan bergoyang lembut mengikuti waktu.
  - `forge_gear`: Alas batu dengan roda gigi kuningan dan perunggu berjeruji 8-gigi yang berputar kontinu.
  - `celestial_orrery`: Pedestal sandstone dengan dua cincin astrolabe berputar berlawanan arah, matahari pusat bercahaya, serta dua planet pengorbit.
- **Sub-Crystal & Klimaks Level 10 (`src/three/assets/PuzzleMechanisms.tsx`)**:
  - `SubCrystalNode`: Resonator kristal sekunder berbingkai kuningan yang menyala turquoise dan memunculkan cincin orbit saat terkena sinar.
  - `CrystalAltarNode` (`isEternal` pada Level 10): Skala kristal utama diperbesar (`1.18x`) dan memancarkan pilar cahaya menjulang ke langit saat *Eternal Crystal* dipulihkan.
  - `ElevationPlatformNode`: Tinggi tiang rel kuningan dihitung dinamis berdasarkan selisih `highElevation - lowElevation`.
  - `LightBeamsLayer`: Kapasitas segmen sinar ditingkatkan dari `10` menjadi `14` untuk mendukung level multi-emiter kompleks.

### 5.2 Perbaikan Logika & Visual Penting Selama Ekspansi
1. **Deduplikasi Tile Otomatis (`addRect` di `src/game/levels.ts`)**:
   - Diperbaiki agar `addRect` menggunakan `setTile` sehingga area persegi yang saling bertumpuk (seperti balkon atas Level 06) menimpa koordinat `(x, z)` secara bersih tanpa menghasilkan tile duplikat.
2. **Perbaikan Jalur & Layout Level 04, 08, dan 10 (`src/game/levels.ts`)**:
   - **Level 04**: Membuka blokade prop di sisi altar puncak `(3, 0)` dan `(5, 0)` agar jalur menuju `portal4` dapat dilalui.
   - **Level 08**: Memindahkan `ruin_pillar` ke `(6, -3)` dan `(8, -3)` agar koridor di sekitar `gate8b` menuju `crystal8` dan `portal8` terbuka penuh.
   - **Level 10**: Menata ulang `celestial_orrery` dan `stone_lantern` ke `z = -2` serta merapikan arah awal `prism10a` dan `prism10c` agar jalur pemain dan jalur sinar tetap bersih tanpa terpotong.
3. **Pemutusan Sinar di Void (`traceLightPass` di `src/game/rules.ts`)**:
   - Mengganti pengecekan `step === 5 && !tile` dengan penghitung `consecutiveVoidSteps >= 4` agar sinar yang melewati pulau lain tidak pernah menembus 24 tile ke luar layar.
4. **Penyesuaian Framing Kamera & Latar Langit (`src/three/SkyBackdrop.tsx`, `src/game/levels.ts`)**:
   - Menurunkan posisi vertikal `DISTANT_ISLANDS` (`y: -11.0` hingga `-13.2`) agar ujung pulau latar tidak memotong tepi atas viewport pada level dengan zoom lebar (Level 05, 08, 10).
   - Menyesuaikan `cameraZoom` Level 05 ke `0.62` agar ketiga pulau taman tampil utuh dan seimbang.
5. **UI & Kompatibilitas Save (`src/ui/GameModals.tsx`, `src/App.tsx`, `src/game/progression.ts`)**:
   - Menambahkan container scrollable (`max-h-[60vh] overflow-y-auto`) dan penghitung progres `X / 10 Restored` pada `LevelSelectModal`.
   - Menambahkan tombol `Islands` pada `VictoryModal` dan memperbarui pesan penyelesaian akhir untuk 10 pulau.
   - `validateSaveProgress` otomatis membuka Level 4 bagi pemain dengan data simpanan lama `[1, 2, 3]` tanpa menghapus `bestTimes`.

---

## 6. Status Verifikasi Terakhir

- **Unit Tests (`npx --yes tsx --test src/game/rules.test.ts`)**: **13 / 13 lulus**
  - Memverifikasi tepat 10 level dengan ID `1..10`, nol tile duplikat per level, titik spawn valid, simulasi solusi lengkap + keterjangkauan jalur (*BFS walkability & collision*) untuk Level 01 hingga Level 10, blokade *void* / gerbang tertutup / kolam air, serta migrasi save 3-level ke 10-level.
- **Type Check & Build (`npm run lint` / `tsc --noEmit` & `vite build`)**: Lulus tanpa error.
- **Verifikasi Browser (`playwright-cli` pada Chromium `1440×900`)**:
  - Terverifikasi tampilan modal *Floating Islands* (10 level), state `Pause` (`Esc`), serta rendering 3D Level 05, Level 08, dan Level 10 dengan **0 console errors**.
