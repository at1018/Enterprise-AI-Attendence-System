import { Router } from 'express';
import { FaceRecognitionResultController } from './faceRecognitionResult.controller';

export function createFaceRecognitionResultRoutes(faceRecognitionResultController: FaceRecognitionResultController): Router {
  const router = Router();

  // Create recognition result
  router.post('/recognition/results', faceRecognitionResultController.createResult);

  // Get result by ID
  router.get('/recognition/results/:id', faceRecognitionResultController.getResultById);

  // Get results by session
  router.get('/recognition/results/session/:sessionId', faceRecognitionResultController.getResultsBySession);

  // Get results by student
  router.get('/recognition/results/student/:studentId', faceRecognitionResultController.getResultsByStudent);

  // Get results by device
  router.get('/recognition/results/device/:deviceId', faceRecognitionResultController.getResultsByDevice);

  // Get results by tenant
  router.get('/recognition/results', faceRecognitionResultController.getResultsByTenant);

  return router;
}
