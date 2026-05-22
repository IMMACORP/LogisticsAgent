import { BaseRepository } from './base.repository';
export class AuditRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    create(args, tx) {
        return this.exec(tx).auditLog.create(args);
    }
    findMany(args, tx) {
        return this.exec(tx).auditLog.findMany(args);
    }
}
