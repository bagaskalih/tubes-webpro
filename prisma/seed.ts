const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Expert Users
  const expertUsers = [
    {
      email: "siti@gmail.com",
      name: "Siti Rahayu",
      password: await hash("expert123", 10),
      role: "EXPERT",
      specialty: "NUTRISI_ANAK",
      about: "Spesialis gizi anak dengan pengalaman 10 tahun",
    },
    {
      email: "budi.psikolog@gmail.com",
      name: "Budi Santoso, M.Psi",
      password: await hash("expert123", 10),
      role: "EXPERT",
      specialty: "PSIKOLOGI_ANAK",
      about: "Psikolog anak berpengalaman dengan fokus pada perkembangan anak",
    },
    {
      email: "dewi.parenting@gmail.com",
      name: "Dewi Kusuma",
      password: await hash("expert123", 10),
      role: "EXPERT",
      specialty: "PARENTING",
      about: "Konsultan parenting dan penulis buku parenting bestseller",
    },
    {
      email: "ahmad@gmail.com",
      name: "Ahmad Wijaya",
      password: await hash("expert123", 10),
      role: "EXPERT",
      specialty: "PERTUMBUHAN_ANAK",
      about: "Dokter spesialis tumbuh kembang anak",
    },
    {
      email: "rini.edu@gmail.com",
      name: "Rini Pratiwi, M.Pd",
      password: await hash("expert123", 10),
      role: "EXPERT",
      specialty: "EDUKASI_ANAK",
      about: "Pakar pendidikan anak usia dini",
    },
  ];

  for (const expert of expertUsers) {
    await prisma.user.upsert({
      where: { email: expert.email },
      update: {},
      create: expert,
    });
  }

  // Regular Users
  const regularUsers = [
    {
      email: "anita@gmail.com",
      name: "Anita Wijaya",
      password: await hash("user123", 10),
      role: "USER",
    },
    {
      email: "bambang@gmail.com",
      name: "Bambang Supriyanto",
      password: await hash("user123", 10),
      role: "USER",
    },
    {
      email: "citra@gmail.com",
      name: "Citra Pertiwi",
      password: await hash("user123", 10),
      role: "USER",
    },
    {
      email: "doni@gmail.com",
      name: "Doni Kusuma",
      password: await hash("user123", 10),
      role: "USER",
    },
    {
      email: "eka@gmail.com",
      name: "Eka Putri",
      password: await hash("user123", 10),
      role: "USER",
    },
  ];

  for (const user of regularUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Create Posts
  const posts = [
    {
      title: "Victim Mentality pada Generasi Z",
      content:
        "Generasi Z, yang lahir antara pertengahan 1990-an hingga awal 2010-an, kerap dikaitkan dengan label 'rentan stres' dan 'labil.'...",
      image: "https://example.com/images/gen-z-mental-health.jpg",
      authorId: 1, // Admin
    },
    {
      title: "Pentingnya ASI Eksklusif untuk Tumbuh Kembang Anak",
      content:
        "ASI eksklusif adalah pemberian ASI tanpa tambahan makanan atau minuman lain selama 6 bulan pertama kehidupan bayi...",
      image: "https://example.com/images/asi-ekslusif.jpg",
      authorId: 2, // Expert
    },
    {
      title: "Tips Mengatasi Tantrum pada Balita",
      content:
        "Tantrum adalah ledakan emosi yang umum terjadi pada anak usia 1-4 tahun. Berikut adalah cara menghadapinya...",
      image: "https://example.com/images/tantrum.jpg",
      authorId: 3,
    },
    {
      title: "Membangun Kemandirian Anak Sejak Dini",
      content:
        "Kemandirian adalah salah satu aspek penting dalam tumbuh kembang anak. Bagaimana cara membangunnya?...",
      image: "https://example.com/images/kemandirian-anak.jpg",
      authorId: 4,
    },
    {
      title: "Nutrisi Penting untuk Otak Anak",
      content:
        "Perkembangan otak anak sangat dipengaruhi oleh asupan nutrisi yang tepat. Berikut adalah nutrisi-nutrisi penting...",
      image: "https://example.com/images/nutrisi-otak.jpg",
      authorId: 2,
    },
    {
      title: "Metode Montessori dalam Pendidikan Anak",
      content:
        "Metode Montessori adalah pendekatan pendidikan yang berfokus pada kemandirian dan kebebasan anak dalam batas tertentu...",
      image: "https://example.com/images/montessori.jpg",
      authorId: 6,
    },
    {
      title: "Dampak Gadget pada Perkembangan Anak",
      content:
        "Penggunaan gadget pada anak dapat memberikan dampak positif dan negatif. Bagaimana cara menyikapinya?...",
      image: "https://example.com/images/gadget-impact.jpg",
      authorId: 5,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    });
  }

  // Create Threads
  const threads = [
    {
      title: "Screen time anak",
      content:
        "Mau tanya dong parent-parent apakah anak kalian diberikan screen time per harinya? Bagaimana cara mengaturnya?",
      category: "TEKNOLOGI",
      authorId: 8,
    },
    {
      title: "Rekomendasi PAUD di Jakarta Selatan",
      content:
        "Ada yang bisa rekomendasikan PAUD yang bagus di daerah Jakarta Selatan? Budget 2-3 juta per bulan.",
      category: "EDUKASI",
      authorId: 9,
    },
    {
      title: "Tips Mengatasi Anak Susah Makan",
      content:
        "Anak saya (3 tahun) sangat susah makan. Ada yang punya pengalaman mengatasinya?",
      category: "KESEHATAN",
      authorId: 10,
    },
    {
      title: "Vaksin COVID untuk Anak",
      content:
        "Bagaimana pendapat para expert soal vaksin COVID untuk anak usia 5 tahun ke bawah?",
      category: "KESEHATAN",
      authorId: 11,
    },
    {
      title: "Rekomendasi Vitamin Anak",
      content:
        "Minta rekomendasi vitamin anak yang bagus dong. Anak saya usia 4 tahun.",
      category: "KESEHATAN",
      authorId: 7,
    },
    {
      title: "Cara Mengajarkan Membaca pada Anak",
      content:
        "Ada yang punya tips mengajarkan membaca pada anak usia 4 tahun?",
      category: "EDUKASI",
      authorId: 8,
    },
    {
      title: "Masalah Bullying di Sekolah",
      content:
        "Bagaimana cara mengatasi anak yang mengalami bullying di sekolah?",
      category: "UMUM",
      authorId: 9,
    },
    {
      title: "Rekomendasi Mainan Edukatif",
      content:
        "Butuh rekomendasi mainan edukatif untuk anak usia 2 tahun. Budget 500rb.",
      category: "EDUKASI",
      authorId: 10,
    },
  ];

  for (const thread of threads) {
    await prisma.thread.create({
      data: thread,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
