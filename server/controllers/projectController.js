/**
 * Project Controller
 * Handles CRUD operations for presentation projects.
 * Uses MongoDB via Mongoose for storage.
 */

const Project = require('../models/Project');

// ─── Controller Methods ───────────────────────────────────────────────────────

/**
 * GET /api/projects
 * Returns all projects belonging to the authenticated user.
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ updatedAt: -1 });
    console.log(`[PROJECTS] GET all — ${projects.length} project(s) for user ${req.user.email}`);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/projects/:id
 * Returns a single project by ID (only if it belongs to the user).
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    console.log(`[PROJECTS] GET ${project.id} — "${project.title}"`);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/projects
 * Creates a new project for the authenticated user.
 * Body: { title, slides? }
 */
const createProject = async (req, res, next) => {
  try {
    const { title, slides } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'A non-empty "title" string is required',
      });
    }

    const project = await Project.create({
      title: title.trim(),
      user: req.user._id,
      slides: Array.isArray(slides) ? slides : [],
    });

    console.log(`[PROJECTS] CREATED "${project.title}" (${project.id}) for user ${req.user.email}`);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/projects/:id
 * Updates an existing project. Accepts any combination of { title, slides }.
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { title, slides } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '"title" must be a non-empty string',
        });
      }
      project.title = title.trim();
    }

    if (slides !== undefined) {
      if (!Array.isArray(slides)) {
        return res.status(400).json({
          success: false,
          error: '"slides" must be an array',
        });
      }
      project.slides = slides;
    }

    await project.save();

    console.log(`[PROJECTS] UPDATED "${project.title}" (${project.id})`);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/projects/:id
 * Deletes a project by ID (only if it belongs to the user).
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    console.log(`[PROJECTS] DELETED "${project.title}" (${project.id})`);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
