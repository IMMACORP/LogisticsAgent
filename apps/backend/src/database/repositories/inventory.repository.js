import { BaseRepository } from './base.repository';
export class InventoryRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findUnique(args, tx) {
        return this.exec(tx).inventory.findUnique(args);
    }
    findFirst(args, tx) {
        return this.exec(tx).inventory.findFirst(args);
    }
    findMany(args, tx) {
        return this.exec(tx).inventory.findMany(args);
    }
    create(args, tx) {
        return this.exec(tx).inventory.create(args);
    }
    createMany(args, tx) {
        return this.exec(tx).inventory.createMany(args);
    }
    update(args, tx) {
        return this.exec(tx).inventory.update(args);
    }
    updateMany(args, tx) {
        return this.exec(tx).inventory.updateMany(args);
    }
    upsert(args, tx) {
        return this.exec(tx).inventory.upsert(args);
    }
    delete(args, tx) {
        return this.exec(tx).inventory.delete(args);
    }
    deleteMany(args, tx) {
        return this.exec(tx).inventory.deleteMany(args);
    }
    count(args, tx) {
        return this.exec(tx).inventory.count(args);
    }
    aggregate(args, tx) {
        return this.exec(tx).inventory.aggregate(args);
    }
}
