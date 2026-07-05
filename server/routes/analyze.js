import express from 'express';
import { analyzeBatchResumes, analyzeResume } from '../controllers/analyzeController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('file'), analyzeResume);
router.post('/batch', upload.array('files', 10), analyzeBatchResumes);

export default router;
