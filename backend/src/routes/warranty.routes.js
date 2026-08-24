import { Router } from 'express';
import multer from 'multer';
import { getWarranties, postWarranty, putWarranty, deleteWarranty } from '../controllers/warranty.controller.js';
import { previewImport, confirmImport } from '../controllers/warrantyImport.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', getWarranties);
router.post('/', postWarranty);
router.post('/import/preview', upload.single('file'), previewImport);
router.post('/import/confirm', confirmImport);
router.put('/:id', putWarranty);
router.delete('/:id', deleteWarranty);

export default router;
