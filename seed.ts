import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("Heitor2706$", 10);
  await prisma.user.upsert({
    where: { email: "tiomagrosete@gmail.com" },
    update: {},
    create: {
      email: "tiomagrosete@gmail.com",
      name: "Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create test user
  const testPassword = await bcrypt.hash("johndoe123", 10);
  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      name: "John Doe",
      password: testPassword,
      role: Role.ADMIN,
    },
  });

  // Create cliente test user
  const clientePassword = await bcrypt.hash("teste123", 10);
  await prisma.user.upsert({
    where: { email: "cliente@teste.com" },
    update: {},
    create: {
      email: "cliente@teste.com",
      name: "Cliente Teste",
      password: clientePassword,
      role: Role.USER,
    },
  });

  // Create Pix config
  const existingConfig = await prisma.paymentConfig.findFirst();
  if (!existingConfig) {
    await prisma.paymentConfig.create({
      data: {
        pixKey: "4a2a70fd-48f0-4a15-9419-1c16fa5703c3",
      },
    });
  }

  // Create sample products
  const products = [
    { name: "Gift Card R$50", description: "Cartão presente de R$50", price: 50, stock: 10 },
    { name: "Gift Card R$100", description: "Cartão presente de R$100", price: 100, stock: 10 },
    { name: "Gift Card R$200", description: "Cartão presente de R$200", price: 200, stock: 5 },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
