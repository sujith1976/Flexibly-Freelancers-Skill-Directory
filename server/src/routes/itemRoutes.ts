import express from 'express';
import { 
  getItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem 
} from '../controllers/itemController';

const router = express.Router();

// GET all items
router.get('/', getItems);

// GET a single item
router.get('/:id', getItem);

// POST a new item
router.post('/', createItem);

// PUT update an item
router.put('/:id', updateItem);

// DELETE an item
router.delete('/:id', deleteItem);

export default router; 