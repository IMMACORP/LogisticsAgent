import { BaseRepository } from './base.repository';
export class ConversationRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findUnique(args, tx) {
        return this.exec(tx).conversation.findUnique(args);
    }
    findFirst(args, tx) {
        return this.exec(tx).conversation.findFirst(args);
    }
    findMany(args, tx) {
        return this.exec(tx).conversation.findMany(args);
    }
    create(args, tx) {
        return this.exec(tx).conversation.create(args);
    }
    createMany(args, tx) {
        return this.exec(tx).conversation.createMany(args);
    }
    update(args, tx) {
        return this.exec(tx).conversation.update(args);
    }
    updateMany(args, tx) {
        return this.exec(tx).conversation.updateMany(args);
    }
    upsert(args, tx) {
        return this.exec(tx).conversation.upsert(args);
    }
    delete(args, tx) {
        return this.exec(tx).conversation.delete(args);
    }
    deleteMany(args, tx) {
        return this.exec(tx).conversation.deleteMany(args);
    }
    count(args, tx) {
        return this.exec(tx).conversation.count(args);
    }
    aggregate(args, tx) {
        return this.exec(tx).conversation.aggregate(args);
    }
}
