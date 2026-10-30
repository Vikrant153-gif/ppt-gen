/**
 * Project Routes
 * All routes are protected — require authentication.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// All project routes require authentication
router.use(protect);

// GET    /api/projects        — list all projects for current user
router.get('/', getAllProjects);

// GET    /api/projects/:id    — get a single project
router.get('/:id', getProjectById);

// POST   /api/projects        — create a new project
router.post('/', createProject);

// PUT    /api/projects/:id    — update an existing project
router.put('/:id', updateProject);

// DELETE /api/projects/:id    — delete a project
router.delete('/:id', deleteProject);

module.exports = router;
