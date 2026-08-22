import { Router } from 'express';
import multer from 'multer';
import {
  getComputers,
  postComputer,
  putComputer,
  deleteComputer,
} from '../controllers/computer.controller.js';
import { previewImport, confirmImport } from '../controllers/computerImport.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', getComputers);
router.post('/', postComputer);
router.post('/import/preview', upload.single('file'), previewImport);
router.post('/import/confirm', confirmImport);
router.put('/:id', putComputer);
router.delete('/:id', deleteComputer);

export default router;
