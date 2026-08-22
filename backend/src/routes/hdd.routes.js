import { Router } from 'express';
import {
  getDashboard,
  getInventory,
  getManifest,
  getMainRecord,
  getDetailSheet,
  postMainRecord,
  putMainRecord,
  postDetailSheet,
  putDetailSheet,
  search,
} from '../controllers/hdd.controller.js';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/inventory', getInventory);
router.get('/manifest', getManifest);
router.get('/search', search);
router.get('/main/:id', getMainRecord);
router.post('/main', postMainRecord);
router.put('/main/:id', putMainRecord);
router.get('/detail/:id', getDetailSheet);
router.post('/detail', postDetailSheet);
router.put('/detail/:id', putDetailSheet);

export default router;
