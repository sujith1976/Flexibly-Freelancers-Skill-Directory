import { Request, Response } from 'express';
import Freelancer, { IFreelancer } from '../models/Freelancer';

// Add a new freelancer
export const addFreelancer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, skills } = req.body;
    
    // Validate required fields
    if (!name || !email || !skills || skills.length === 0) {
      res.status(400).json({ message: 'Name, email, and at least one skill are required' });
      return;
    }
    
    // Check if freelancer with email already exists
    const existingFreelancer = await Freelancer.findOne({ email });
    if (existingFreelancer) {
      res.status(400).json({ message: 'Freelancer with this email already exists' });
      return;
    }
    
    const newFreelancer: IFreelancer = new Freelancer({
      name,
      email,
      skills
    });
    
    const savedFreelancer = await newFreelancer.save();
    res.status(201).json(savedFreelancer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get all freelancers
export const getAllFreelancers = async (req: Request, res: Response): Promise<void> => {
  try {
    const freelancers = await Freelancer.find();
    res.status(200).json(freelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Search freelancers by skills
export const searchFreelancersBySkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skills } = req.query;
    
    if (!skills) {
      res.status(400).json({ message: 'Skills are required for search' });
      return;
    }
    
    // Handle both string and array formats from the query
    let skillsArray: string[];
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(skill => skill.trim().toLowerCase());
    } else {
      skillsArray = skills as string[];
    }
    
    // Find freelancers that have any of the requested skills
    const freelancers = await Freelancer.find({
      skills: { $in: skillsArray }
    });
    
    res.status(200).json(freelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get a single freelancer
export const getFreelancer = async (req: Request, res: Response): Promise<void> => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    
    if (!freelancer) {
      res.status(404).json({ message: 'Freelancer not found' });
      return;
    }
    
    res.status(200).json(freelancer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}; 