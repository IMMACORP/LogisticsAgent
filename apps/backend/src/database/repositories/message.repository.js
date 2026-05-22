import { BaseRepository } from './base.repository';
export class MessageRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findMany(args, tx) {
        return this.exec(tx).message.findMany(args);
    }
    create(args, tx) {
        return this.exec(tx).message.create(args);
    }
    count(args, tx) {
        return this.exec(tx).message.count(args);
    }
}
