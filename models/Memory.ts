import mongoose from 'mongoose';

export interface IMemorySchema extends mongoose.Document {
  title: string;
  contents: string;
  date: Date;
  userId: string;
}

const MemorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  contents: { type: String, required: true },
  date: { type: Date, required: true },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Memory', MemorySchema);
