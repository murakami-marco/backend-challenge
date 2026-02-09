const express = require('express');
const jwt = require('jsonwebtoken');
const { applyPatch } = require('fast-json-patch');
const User = require('./models/User');
const Organization = require('./models/Organization');
const authMiddleware = require('./middleware/auth');
const {
  validateRegister,
  validateLogin,
} = require('./validators/userValidator');
const {
  validateCreateOrganization,
  validateJsonPatch,
} = require('./validators/orgValidator');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/auth/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = new User({ email, password });
    await user.save();

    console.log(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /organization:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               addresses:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/organization',
  authMiddleware,
  validateCreateOrganization,
  async (req, res, next) => {
    try {
      const organization = new Organization(req.body);
      await organization.save();

      console.log(`Organization created: ${organization.name}`);

      res.status(201).json(organization);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /organization:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 */
router.get('/organization', authMiddleware, async (req, res, next) => {
  try {
    const organizations = await Organization.find();

    console.log(`Retrieved ${organizations.length} organizations`);

    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /organization/{id}:
 *   get:
 *     summary: Get a specific organization by ID
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *       401:
 *         description: Unauthorized
 */
router.get('/organization/:id', authMiddleware, async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Organization not found',
      });
    }

    console.log(`Retrieved organization: ${organization.name}`);

    res.json(organization);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /organization/{id}:
 *   patch:
 *     summary: Update an organization using JSON Patch
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 op:
 *                   type: string
 *                   enum: [add, remove, replace, move, copy, test]
 *                 path:
 *                   type: string
 *                 value:
 *                   type: any
 *           example:
 *             - op: replace
 *               path: /name
 *               value: New Organization Name
 *             - op: add
 *               path: /addresses/-
 *               value:
 *                 street: 456 Oak Ave
 *                 city: Boston
 *                 state: MA
 *                 zip: '02101'
 *                 country: USA
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *       400:
 *         description: Invalid patch operation
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/organization/:id',
  authMiddleware,
  validateJsonPatch,
  async (req, res, next) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      // Convert to plain object for patching
      const orgObject = organization.toObject();

      // Apply JSON Patch
      const patchResult = applyPatch(orgObject, req.body, true, false);

      if (patchResult.newDocument) {
        // Update organization with patched data
        Object.assign(organization, patchResult.newDocument);
        await organization.save();

        console.log(`Organization updated: ${organization.name}`);

        res.json(organization);
      } else {
        throw new Error('Patch operation failed');
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /organization/{id}:
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *       404:
 *         description: Organization not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/organization/:id', authMiddleware, async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);

    if (!organization) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Organization not found',
      });
    }

    console.log(`Organization deleted: ${organization.name}`);

    res.json({
      message: 'Organization deleted successfully',
      organization,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
