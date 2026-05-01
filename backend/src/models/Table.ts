import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  tableNumber: string;
  name?: string;
  capacity: number;
  sortOrder: number;
  status: 'Free' | 'Occupied' | 'Reserved' | 'Cleaning';
  currentOrder?: string;
  occupiedTime?: string;
  server?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TableSchema: Schema = new Schema({
  tableNumber: {
    type: String,
    required: [true, 'Table number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [50, 'Capacity cannot exceed 50']
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Free', 'Occupied', 'Reserved', 'Cleaning'],
    default: 'Free'
  },
  currentOrder: {
    type: String,
    trim: true
  },
  occupiedTime: {
    type: String,
    trim: true
  },
  server: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance

TableSchema.index({ status: 1 });
TableSchema.index({ sortOrder: 1 });

export default mongoose.model<ITable>('Table', TableSchema);
