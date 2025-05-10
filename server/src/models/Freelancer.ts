import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancer extends Document {
  name: string;
  email: string;
  skills: string[];
  createdAt: Date;
}

const FreelancerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  skills: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for better search performance
FreelancerSchema.index({ skills: 1 });

export default mongoose.model<IFreelancer>('Freelancer', FreelancerSchema); 