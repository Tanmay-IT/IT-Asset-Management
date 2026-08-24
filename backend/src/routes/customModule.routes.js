import { Router } from 'express';
import multer from 'multer';
import {
  getModules,
  postModule,
  deleteModuleHandler,
  postColumn,
  getRecords,
  postRecord,
  putRecord,
  deleteRecord,
} from '../controllers/customModule.controller.js';
import { previewImport, confirmImport } from '../controllers/customModuleImport.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', getModules);
router.post('/', postModule);
router.delete('/:slug', deleteModuleHandler);

router.post('/:slug/columns', postColumn);

router.get('/:slug/records', getRecords);
router.post('/:slug/records', postRecord);
router.put('/:slug/records/:id', putRecord);
router.delete('/:slug/records/:id', deleteRecord);

router.post('/:slug/import/preview', upload.single('file'), previewImport);
router.post('/:slug/import/confirm', confirmImport);

export default router;
