import { prisma } from "../src/database/db";

async function main() {
  const references = await prisma.place.findMany({
    where: {
      buildingId: { not: null }
    },
    include: {
      building: true
    }
  });

  console.log("=== REFERENCES IN DATABASE ===");
  for (const ref of references) {
    console.log(`Reference: "${ref.nameEn}" (ID: ${ref.id})`);
    console.log(`  Coordinates: [${ref.latitude}, ${ref.longitude}]`);
    console.log(`  Parent Building: "${ref.building?.nameEn}" (ID: ${ref.buildingId})`);
    console.log(`  Parent Coordinates: [${ref.building?.latitude}, ${ref.building?.longitude}]`);
    console.log(`  Coordinates Match Parent? ${ref.latitude === ref.building?.latitude && ref.longitude === ref.building?.longitude ? "YES" : "NO"}`);
    console.log("-----------------------------------------");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
