import { prisma } from '../database/client';
import { ShipmentRepository } from '../database/repositories/shipment.repository';
import { ShipmentService } from './shipment.service';

const shipmentRepository = new ShipmentRepository(prisma);

export const shipmentService = new ShipmentService(shipmentRepository);
