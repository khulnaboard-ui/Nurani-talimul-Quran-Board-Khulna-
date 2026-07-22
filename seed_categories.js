const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { name: 'বই', isClassWise: true },
    { name: 'খাতা', isClassWise: false },
    { name: 'কলম', isClassWise: false },
    { name: 'পেন্সিল', isClassWise: false },
    { name: 'ডাস্টার', isClassWise: false },
    { name: 'স্লেট', isClassWise: false },
  ];

  for (const cat of defaultCategories) {
    await prisma.storeCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  
  console.log("Default categories seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
