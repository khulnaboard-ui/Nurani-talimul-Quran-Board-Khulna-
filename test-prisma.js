const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const product = await prisma.storeProduct.create({
      data: {
        name: 'Test Product',
        category: 'বই',
        price: 100,
        stock: 10,
        unit: 'টি'
      }
    });
    console.log('Success:', product);
  } catch (error) {
    console.error('Error creating product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
