export class BaseRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    exec(tx) {
        return tx ?? this.prisma;
    }
}
