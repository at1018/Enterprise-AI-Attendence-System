import { Router } from 'express';
import { FaceEnrollmentController } from './faceEnrollment.controller';

export function createFaceEnrollmentRoutes(faceEnrollmentController: FaceEnrollmentController): Router {
  const router = Router();

  // Enroll face
  router.post('/enroll', faceEnrollmentController.enrollFace);

  // Get enrollment by student
  router.get('/enrollments/student/:studentId', faceEnrollmentController.getEnrollmentByStudent);

  // Get all enrollments for tenant
  router.get('/enrollments', faceEnrollmentController.getEnrollmentsByTenant);

  // Deactivate enrollment
  router.put('/enrollments/:studentId/deactivate', faceEnrollmentController.deactivateEnrollment);

  // Delete enrollment with audit trail
  router.delete('/enrollments', faceEnrollmentController.deleteEnrollment);

  return router;
}
