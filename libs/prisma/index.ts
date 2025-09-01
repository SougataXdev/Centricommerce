import { PrismaClient } from "@prisma/client";


declare global {
    namespace globalThis {
        var prismaDb: PrismaClient | undefined;
    }
}



const prisma = globalThis.prismaDb || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prismaDb = prisma;


export default prisma;