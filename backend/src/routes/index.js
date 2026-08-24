import { Router } from 'express';
import computerRoutes from './computer.routes.js';
import serverRoomItemRoutes from './serverRoomItem.routes.js';
import hddRoutes from './hdd.routes.js';
import tonerRoutes from './toner.routes.js';
import warrantyRoutes from './warranty.routes.js';
import customModuleRoutes from './customModule.routes.js';

const router = Router();

router.use('/computers', computerRoutes);
router.use('/server-room-items', serverRoomItemRoutes);
router.use('/hdd', hddRoutes);
router.use('/toners', tonerRoutes);
router.use('/warranty', warrantyRoutes);
router.use('/custom-modules', customModuleRoutes);

export default router;
