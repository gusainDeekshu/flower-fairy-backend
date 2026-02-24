import { PrismaClient, Role, OrderStatus, PaymentProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Create a Default Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowerfairy.com' },
    update: {},
    create: {
      email: 'admin@flowerfairy.com',
      name: 'Admin User',
      password: 'hashed_password_here', // In production, use bcrypt to hash passwords
      role: Role.ADMIN,
    },
  });

  // 2. Create the Main Store
  const store = await prisma.store.upsert({
    where: { slug: 'flower-fairy-dehradun' },
    update: {},
    create: {
      name: 'Flower Fairy',
      slug: 'flower-fairy-dehradun',
      industry: 'Floral & Gifting',
      paymentConfig: {
        provider: 'RAZORPAY',
        enabled: true,
      },
      themeConfig: {
        primary: "#009688",
        secondary: "#22C55E",
        accent: "#F0FDF4",
      },
    },
  });

  // 3. Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'roses' },
      update: {},
      create: { name: 'Roses', slug: 'roses' },
    }),
    prisma.category.upsert({
      where: { slug: 'cakes' },
      update: {},
      create: { name: 'Cakes', slug: 'cakes' },
    }),
    prisma.category.upsert({
      where: { slug: 'combos' },
      update: {},
      create: { name: 'Combos', slug: 'combos' },
    }),
  ]);

  // 4. Create Products and Variants
  const productsData = [
    {
      name: 'Premium Red Roses Bouquet',
      slug: 'premium-red-roses',
      price: 499,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9',
      categoryId: categories[0].id,
      variants: [
        { name: 'Standard (10 stems)', priceModifier: 0, stock: 50 },
        { name: 'Luxury (20 stems)', priceModifier: 300, stock: 30 },
      ],
    },
    {
      name: 'Truffle Chocolate Cake',
      slug: 'truffle-chocolate-cake',
      price: 699,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
      categoryId: categories[1].id,
      variants: [
        { name: '500g', priceModifier: 0, stock: 20 },
        { name: '1kg', priceModifier: 500, stock: 15 },
      ],
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        storeId: store.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.image,
        categoryId: p.categoryId,
        variants: {
          create: p.variants,
        },
      },
    });
  }

  // 5. Create Shipping Rules
  await prisma.shippingRule.createMany({
    data: [
      { storeId: store.id, pincode: '248001', deliveryCharge: 50, isOperational: true },
      { storeId: store.id, pincode: '248002', deliveryCharge: 0, isOperational: true }, // Free delivery zone
    ],
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });