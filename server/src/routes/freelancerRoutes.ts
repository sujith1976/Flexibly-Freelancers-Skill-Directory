import express from 'express';
import {
  addFreelancer,
  getAllFreelancers,
  getFreelancer,
  searchFreelancersBySkills
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

export default router; 