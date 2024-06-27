// routes/index.js

import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController'; // Import the FilesController
//import authMiddleware from '../middleware/auth'; //The middleware
const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

// Add the new endpoints
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// Add the endpoint for file uploads
router.post('/files', FilesController.postUpload);

// Add new endpoints for file retrieval
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

export default router;
