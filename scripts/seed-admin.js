import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
    const passwordHash = await bcrypt.hash("Admin@123", 12);

    await prisma.user.create({
        data: {
            username: "admin",
            email: "admin@example.com",
            passwordHash,
            role: "admin",
            isActive: true,
        },
    });

    console.log("Admin user created");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });