import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  order: number;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 }
});

export default mongoose.model<ICategory>("Category", CategorySchema);
