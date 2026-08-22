import { Router } from 'express';
import multer from 'multer';
import {
  getTonerInward,
  postTonerInward,
  putTonerInward,
  deleteTonerInward,
} from '../controllers/tonerInward.controller.js';
import {
  getTonerOutward,
  postTonerOutward,
  putTonerOutward,
  deleteTonerOutward,
} from '../controllers/tonerOutward.controller.js';
import {
  previewInwardImport,
  confirmInwardImport,
  previewOutwardImport,
  confirmOutwardImport,
} from '../controllers/tonerImport.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/inward', getTonerInward);
router.post('/inward', postTonerInward);
router.post('/inward/import/preview', upload.single('file'), previewInwardImport);
router.post('/inward/import/confirm', confirmInwardImport);
router.put('/inward/:id', putTonerInward);
router.delete('/inward/:id', deleteTonerInward);

router.get('/outward', getTonerOutward);
router.post('/outward', postTonerOutward);
router.post('/outward/import/preview', upload.single('file'), previewOutwardImport);
router.post('/outward/import/confirm', confirmOutwardImport);
router.put('/outward/:id', putTonerOutward);
router.delete('/outward/:id', deleteTonerOutward);

export default router;
