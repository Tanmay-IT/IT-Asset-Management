import { Router } from 'express';
import multer from 'multer';
import {
  getServerRoomItems,
  postServerRoomItem,
  putServerRoomItem,
  deleteServerRoomItem,
} from '../controllers/serverRoomItem.controller.js';
import { previewImport, confirmImport } from '../controllers/serverRoomItemImport.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', getServerRoomItems);
router.post('/', postServerRoomItem);
router.post('/import/preview', upload.single('file'), previewImport);
router.post('/import/confirm', confirmImport);
router.put('/:id', putServerRoomItem);
router.delete('/:id', deleteServerRoomItem);

export default router;
