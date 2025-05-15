import mongoose, { Schema, Document } from 'mongoose';

// Interface for skill ratings
interface SkillRating {
  skill: string;
  rating: number;
}

export interface IFreelancer extends Document {
  name: string;
  email: string;
  location: string;
  skills: string[];
  skillRatings: SkillRating[];
  description: string;
  createdAt: Date;
}

// Create a schema for skill ratings
const SkillRatingSchema = new Schema({
  skill: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  }
});

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
  location: {
    type: String,
    trim: true,
    default: ''
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
  skillRatings: {
    type: [SkillRatingSchema],
    default: []
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000, // Approximately 300 words
    validate: {
      validator: function(text: string) {
        // Count words by splitting on whitespace
        const wordCount = text ? text.trim().split(/\s+/).length : 0;
        return wordCount <= 300;
      },
      message: 'Description cannot exceed 300 words'
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
    
    // If skillRatings doesn't have entries for all skills, add default ratings
    const existingRatedSkills = this.skillRatings.map(sr => sr.skill);
    
    // Find skills that don't have ratings yet
    const unratedSkills = this.skills.filter(skill => 
      !existingRatedSkills.includes(skill)
    );
    
    // Add default ratings for unrated skills
    unratedSkills.forEach(skill => {
      this.skillRatings.push({
        skill,
        rating: 3 // Default rating
      });
    });
  }
  next();
});

// Create index for better search performance
FreelancerSchema.index({ skills: 1 });
FreelancerSchema.index({ location: 1 });

export default mongoose.model<IFreelancer>('Freelancer', FreelancerSchema); 