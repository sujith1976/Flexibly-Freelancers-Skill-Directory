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
    
    // Normalize skills to lowercase
    const normalizedSkills = skills.map((skill: string) => skill.trim().toLowerCase());
    
    const newFreelancer: IFreelancer = new Freelancer({
      name,
      email,
      skills: normalizedSkills
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
      skillsArray = [skills.trim().toLowerCase()];
    } else {
      skillsArray = (skills as string[]).map(skill => skill.trim().toLowerCase());
    }
    
    // Find all freelancers
    const allFreelancers = await Freelancer.find();
    
    // Manual filtering approach as a fallback
    const matchingFreelancers = allFreelancers.filter(freelancer => {
      // Check if freelancer has ALL the required skills (case insensitive)
      return skillsArray.every(searchSkill => 
        freelancer.skills.some(freelancerSkill => 
          freelancerSkill.toLowerCase() === searchSkill.toLowerCase()
        )
      );
    });
    
    res.status(200).json(matchingFreelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
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

// Update a freelancer
export const updateFreelancer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, skills } = req.body;
    
    // Validate required fields
    if (!name || !email || !skills || skills.length === 0) {
      res.status(400).json({ message: 'Name, email, and at least one skill are required' });
      return;
    }
    
    // Normalize skills to lowercase
    const normalizedSkills = skills.map((skill: string) => skill.trim().toLowerCase());
    
    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      id,
      { name, email, skills: normalizedSkills },
      { new: true }
    );
    
    if (!updatedFreelancer) {
      res.status(404).json({ message: 'Freelancer not found' });
      return;
    }
    
    res.status(200).json(updatedFreelancer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete a freelancer
export const deleteFreelancer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const deletedFreelancer = await Freelancer.findByIdAndDelete(id);
    
    if (!deletedFreelancer) {
      res.status(404).json({ message: 'Freelancer not found' });
      return;
    }
    
    res.status(200).json({ message: 'Freelancer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}; 