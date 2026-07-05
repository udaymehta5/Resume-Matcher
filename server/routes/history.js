import express from 'express';
import { deleteHistoryItem, getHistory, getHistoryById } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getHistory);
router.get('/:id', getHistoryById);
router.delete('/:id', deleteHistoryItem);

export default router;
