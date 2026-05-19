import { BaseRepository } from './base.repository';
export class EscalationRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findUnique(args, tx) {
        return this.exec(tx).escalationLog.findUnique(args);
    }
    findFirst(args, tx) {
        return this.exec(tx).escalationLog.findFirst(args);
    }
    findMany(args, tx) {
        return this.exec(tx).escalationLog.findMany(args);
    }
    create(args, tx) {
        return this.exec(tx).escalationLog.create(args);
    }
    createMany(args, tx) {
        return this.exec(tx).escalationLog.createMany(args);
    }
    update(args, tx) {
        return this.exec(tx).escalationLog.update(args);
    }
    updateMany(args, tx) {
        return this.exec(tx).escalationLog.updateMany(args);
    }
    upsert(args, tx) {
        return this.exec(tx).escalationLog.upsert(args);
    }
    delete(args, tx) {
        return this.exec(tx).escalationLog.delete(args);
    }
    deleteMany(args, tx) {
        return this.exec(tx).escalationLog.deleteMany(args);
    }
    count(args, tx) {
        return this.exec(tx).escalationLog.count(args);
    }
    aggregate(args, tx) {
        return this.exec(tx).escalationLog.aggregate(args);
    }
}
