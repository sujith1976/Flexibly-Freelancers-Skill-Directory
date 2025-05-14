import express from 'express';
import {
  addFreelancer,
  getAllFreelancers,
  getFreelancer,
  searchFreelancersBySkills,
  updateFreelancer,
  deleteFreelancer
} from '../controllers/freelancerController';

const router = express.Router();

// POST a new freelancer
router.post('/', addFreelancer);

// GET all freelancers
router.get('/', getAllFreelancers);

// GET search freelancers by skills
router.get('/search', searchFreelancersBySkills);

// GET a freelancer by ID
router.get('/:id', getFreelancer);

// UPDATE a freelancer by ID
router.put('/:id', updateFreelancer);

// DELETE a freelancer by ID
router.delete('/:id', deleteFreelancer);

export default router; 