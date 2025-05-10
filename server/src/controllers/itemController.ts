import { Request, Response } from 'express';
import Item, { IItem } from '../models/Item';

// Get all items
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get a single item
export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new item
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const newItem: IItem = new Item({
      name: req.body.name,
      description: req.body.description
    });
    
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Update an item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    
    if (!updatedItem) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete an item
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}; 