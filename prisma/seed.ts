import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// 1. Setup the same connection pool used in your service
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Pass the adapter to the constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding with Adapter...');

  // Create Store
  const store = await prisma.store.upsert({
    where: { slug: 'flower-fairy-dehradun' },
    update: {},
    create: {
      name: 'Flower Fairy',
      slug: 'flower-fairy-dehradun',
      industry: 'Floral',
      themeConfig: { primary: "#009688", secondary: "#22C55E" },
      paymentConfig: { provider: "RAZORPAY" }
    }
  });

  // Create Category
  const category = await prisma.category.upsert({
    where: { slug: 'fresh-flowers' },
    update: {},
    create: { name: 'Fresh Flowers', slug: 'fresh-flowers' }
  });

  // Create Product
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
    await pool.end(); // Important: Close the pool so the process can exit
  });