const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
