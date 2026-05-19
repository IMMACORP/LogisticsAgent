export async function withTransaction(prisma, callback, options) {
    return prisma.$transaction(async (tx) => callback(tx), options);
}
