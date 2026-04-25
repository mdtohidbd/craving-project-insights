import express, { Request, Response } from 'express';
import Table from '../models/Table';

const router = express.Router();

// GET /api/tables - Get all tables
router.get('/', async (req: Request, res: Response) => {
  try {
    const tables = await Table.find().sort({ sortOrder: 1, tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
});

// GET /api/tables/:id - Get single table
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ message: 'Failed to fetch table' });
  }
});

// POST /api/tables - Create new table
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tableNumber, name, capacity, sortOrder } = req.body;

    // Validation
    if (!tableNumber || tableNumber.trim() === '') {
      return res.status(400).json({ message: 'Table number is required' });
    }

    if (!capacity || capacity < 1 || capacity > 50) {
      return res.status(400).json({ message: 'Capacity must be between 1 and 50' });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber: tableNumber.trim() });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    // Create new table
    const newTable = new Table({
      tableNumber: tableNumber.trim(),
      name: name?.trim() || undefined,
      capacity: parseInt(capacity),
      sortOrder: parseInt(sortOrder) || 0,
      status: 'Free'
    });

    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error) {
    console.error('Error creating table:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: unknown) => {
        if (typeof err === 'object' && err !== null && 'message' in err) {
          return (err as { message: string }).message;
        }
        return String(err);
      });
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create table' });
  }
});

// PUT /api/tables/:id - Update table
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { tableNumber, name, capacity, sortOrder, status, currentOrder, occupiedTime, server } = req.body;

    // Find table
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Validation for table number if changed
    if (tableNumber && tableNumber.trim() !== table.tableNumber) {
      const existingTable = await Table.findOne({ 
        tableNumber: tableNumber.trim(),
        _id: { $ne: req.params.id }
      });
      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
    }

    // Update fields
    if (tableNumber && tableNumber.trim() !== '') {
      table.tableNumber = tableNumber.trim();
    }
    if (name !== undefined) {
      table.name = name.trim() || undefined;
    }
    if (capacity !== undefined && capacity >= 1 && capacity <= 50) {
      table.capacity = parseInt(capacity);
    }
    if (sortOrder !== undefined) {
      table.sortOrder = parseInt(sortOrder) || 0;
    }
    if (status && ['Free', 'Occupied', 'Reserved', 'Cleaning'].includes(status)) {
      table.status = status;
    }
    if (currentOrder !== undefined) {
      table.currentOrder = currentOrder.trim() || undefined;
    }
    if (occupiedTime !== undefined) {
      table.occupiedTime = occupiedTime.trim() || undefined;
    }
    if (server !== undefined) {
      table.server = server.trim() || undefined;
    }

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: unknown) => {
        if (typeof err === 'object' && err !== null && 'message' in err) {
          return (err as { message: string }).message;
        }
        return String(err);
      });
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update table' });
  }
});

// DELETE /api/tables/:id - Delete table
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Failed to delete table' });
  }
});

// PATCH /api/tables/:id/status - Update table status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, currentOrder, occupiedTime, server } = req.body;

    if (!status || !['Free', 'Occupied', 'Reserved', 'Cleaning'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    table.status = status;
    if (currentOrder !== undefined) {
      table.currentOrder = currentOrder.trim() || undefined;
    }
    if (occupiedTime !== undefined) {
      table.occupiedTime = occupiedTime.trim() || undefined;
    }
    if (server !== undefined) {
      table.server = server.trim() || undefined;
    }

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ message: 'Failed to update table status' });
  }
});

export default router;
