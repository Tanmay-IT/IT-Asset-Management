import { Router } from 'express';
import computerRoutes from './computer.routes.js';
import serverRoomItemRoutes from './serverRoomItem.routes.js';
import hddRoutes from './hdd.routes.js';
import tonerRoutes from './toner.routes.js';

const router = Router();

router.use('/computers', computerRoutes);
router.use('/server-room-items', serverRoomItemRoutes);
router.use('/hdd', hddRoutes);
router.use('/toners', tonerRoutes);

export default router;
