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

  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      email: "user1@gmail.com",
      name: "User1",
      password: await hash("123123123", 10),
      role: "USER",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
