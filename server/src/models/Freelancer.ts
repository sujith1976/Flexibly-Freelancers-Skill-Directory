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
    required: true,
    validate: {
      validator: function(skills: string[]) {
        return skills.length > 0;
      },
      message: 'At least one skill is required'
    },
    set: function(skills: string[]) {
      // Normalize all skills to lowercase and trimmed
      return skills.map(skill => skill.trim().toLowerCase());
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to normalize skills
FreelancerSchema.pre('save', function(this: IFreelancer, next) {
  if (this.isModified('skills')) {
    // Ensure skills are lowercase and trimmed
    this.skills = this.skills.map((skill: string) => skill.trim().toLowerCase());
  }
  next();
});

// Create index for better search performance
FreelancerSchema.index({ skills: 1 });

export default mongoose.model<IFreelancer>('Freelancer', FreelancerSchema); 