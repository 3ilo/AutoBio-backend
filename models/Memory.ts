import mongoose from 'mongoose';

export interface IMemorySchema extends mongoose.Document {
  title: string;
  contents: string;
  date: Date;
  userId: string;
  images: Array<string>
}

const MemorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  contents: { type: String, required: true },
  date: { type: Date, required: true },
  userId: { type: String, required: true },
  images: { type: [String], required: false }
});

module.exports = mongoose.model('Memory', MemorySchema);
