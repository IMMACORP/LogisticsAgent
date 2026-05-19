import { BaseRepository } from './base.repository';
export class ShipmentRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findUnique(args, tx) {
        return this.exec(tx).shipment.findUnique(args);
    }
    findFirst(args, tx) {
        return this.exec(tx).shipment.findFirst(args);
    }
    findMany(args, tx) {
        return this.exec(tx).shipment.findMany(args);
    }
    create(args, tx) {
        return this.exec(tx).shipment.create(args);
    }
    createMany(args, tx) {
        return this.exec(tx).shipment.createMany(args);
    }
    update(args, tx) {
        return this.exec(tx).shipment.update(args);
    }
    updateMany(args, tx) {
        return this.exec(tx).shipment.updateMany(args);
    }
    upsert(args, tx) {
        return this.exec(tx).shipment.upsert(args);
    }
    delete(args, tx) {
        return this.exec(tx).shipment.delete(args);
    }
    deleteMany(args, tx) {
        return this.exec(tx).shipment.deleteMany(args);
    }
    count(args, tx) {
        return this.exec(tx).shipment.count(args);
    }
    aggregate(args, tx) {
        return this.exec(tx).shipment.aggregate(args);
    }
}
