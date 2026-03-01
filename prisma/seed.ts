// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt'; 
import 'dotenv/config';

// 1. Setup the connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // --- 1. Create Admin User ---
  // IMPORTANT: Replace this with your actual Gmail address for Google Login testing
  const adminEmail = 'gusaindeekshant@gmail.com@gmail.com'; 
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN', // This must match the 'ADMIN' role in your enums.prisma
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // --- 2. Create Store ---
  const store = await prisma.store.upsert({
    where: { slug: 'flower-fairy-dehradun' },
    update: {},
    create: {
      name: 'Flower Fairy',
      slug: 'flower-fairy-dehradun',
      industry: 'Floral',
      themeConfig: { primary: "#009688", secondary: "#22C55E" },
      paymentConfig: { provider: "RAZORPAY" } // Matches PaymentProvider enum
    }
  });

  // --- 3. Create Category ---
  const category = await prisma.category.upsert({
    where: { slug: 'fresh-flowers' },
    update: {},
    create: { name: 'Fresh Flowers', slug: 'fresh-flowers' }
  });

  // --- 4. Create Product ---
  await prisma.product.upsert({
    where: { slug: 'red-velvet-roses' },
    update: {},
    create: {
      storeId: store.id,
      categoryId: category.id,
      name: 'Red Velvet Roses',
      slug: 'red-velvet-roses',
      price: 499,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9',
    }
  });

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });