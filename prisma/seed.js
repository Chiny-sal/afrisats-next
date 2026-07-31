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

async function seedSellers() {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < seedData.sellers.length; i++) {
    const seller = seedData.sellers[i];
    const data = {
      name: seller.name,
      email: seller.email,
      seller_token: seller.seller_token,
      location: seller.location,
      country: seller.country,
      flag: seller.flag,
      lnbits_invoice_key: resolveSellerLnbitsKey(seller, i),
      payout_note: seller.payout_note || null,
      created_at: new Date(seller.created_at),
    };

    const existing = await prisma.seller.findUnique({ where: { id: seller.id } });
    if (existing) {
      await prisma.seller.update({
        where: { id: seller.id },
        data: {
          ...data,
          // preserve live earnings; only reset when explicitly reseeding from JSON 0
          total_sats_earned: existing.total_sats_earned,
        },
      });
      updated++;
    } else {
      await prisma.seller.create({
        data: {
          id: seller.id,
          ...data,
          total_sats_earned: seller.total_sats_earned || 0,
        },
      });
      created++;
    }
  }

  return { created, updated };
}

async function seedItems() {
  let created = 0;
  let updated = 0;

  for (const item of seedData.items) {
    const data = {
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
    };

    const existing = await prisma.item.findUnique({ where: { id: item.id } });
    if (existing) {
      await prisma.item.update({ where: { id: item.id }, data });
      updated++;
    } else {
      await prisma.item.create({ data: { id: item.id, ...data } });
      created++;
    }
  }

  return { created, updated };
}

async function main() {
  console.log("Syncing seed data from data/seed.json…");

  const sellers = await seedSellers();
  const items = await seedItems();

  console.log(
    `Sellers: ${sellers.created} created, ${sellers.updated} updated`
  );
  console.log(`Items: ${items.created} created, ${items.updated} updated`);
  console.log(
    `Done — ${seedData.sellers.length} sellers, ${seedData.items.length} items in catalog.`
  );
  console.log(
    "Demo seller tokens (use on /sell or /dashboard):",
    seedData.sellers.map((s) => s.seller_token).join(", ")
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
