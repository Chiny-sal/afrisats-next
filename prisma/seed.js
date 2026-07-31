const path = require("path");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();
const seedData = require("../data/seed.json");

function resolveSellerLnbitsKey(seller, index) {
  if (seller.lnbits_invoice_key) return seller.lnbits_invoice_key;
  const envKey = process.env[`LNBITS_SELLER_${index + 1}_KEY`];
  if (envKey && !envKey.startsWith("your_lnbits")) return envKey;
  return process.env.LNBITS_INVOICE_KEY || "";
}

async function main() {
  const existing = await prisma.seller.findUnique({
    where: { id: "seller-001" },
  });

  if (existing) {
    console.log("Seed data already present — skipping.");
    return;
  }

  console.log("Seeding database…");

  for (let i = 0; i < seedData.sellers.length; i++) {
    const seller = seedData.sellers[i];
    await prisma.seller.create({
      data: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        seller_token: seller.seller_token,
        location: seller.location,
        country: seller.country,
        flag: seller.flag,
        lnbits_invoice_key: resolveSellerLnbitsKey(seller, i),
        payout_note: seller.payout_note || null,
        total_sats_earned: seller.total_sats_earned || 0,
        created_at: new Date(seller.created_at),
      },
    });
  }

  for (const item of seedData.items) {
    await prisma.item.create({
      data: {
        id: item.id,
        seller_id: item.seller_id,
        title: item.title,
        category: item.category,
        product_type: item.product_type,
        description: item.description,
        price_sats: item.price_sats,
        image_url: item.image_url || null,
        thumbnail_seed: item.thumbnail_seed,
        delivery_method: item.delivery_method,
        delivery_value: item.delivery_value,
        active: item.active,
        created_at: new Date(item.created_at),
      },
    });
  }

  console.log(
    `Seeded ${seedData.sellers.length} sellers and ${seedData.items.length} items.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
