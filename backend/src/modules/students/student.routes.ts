import { Router } from 'express';
import { StudentController } from './student.controller';
import { validate } from '../../common/utils/validation.util';
import { createStudentSchema, updateStudentSchema, studentEnrollmentSchema } from './dto/student.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createStudentRoutes = (studentController: StudentController): Router => {
  const router = Router();

  /**
   * POST /api/v1/students
   * Create a new student (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createStudentSchema),
    (req, res, next) => studentController.createStudent(req, res, next)
  );

  /**
   * GET /api/v1/students
   * Get all students for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    studentController.getStudents(req, res, next)
  );

  /**
   * GET /api/v1/students/:id
   * Get student by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    studentController.getStudentById(req, res, next)
  );

  /**
   * GET /api/v1/students/student/:studentId
   * Get student by student ID (authenticated)
   */
  router.get('/student/:studentId', authenticate, (req, res, next) => 
    studentController.getStudentByStudentId(req, res, next)
  );

  /**
   * PUT /api/v1/students/:id
   * Update student (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateStudentSchema),
    (req, res, next) => studentController.updateStudent(req, res, next)
  );

  /**
   * DELETE /api/v1/students/:id
   * Delete student (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => studentController.deleteStudent(req, res, next)
  );

  /**
   * POST /api/v1/students/enroll
   * Enroll student in class/section (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/enroll', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(studentEnrollmentSchema),
    (req, res, next) => studentController.enrollStudent(req, res, next)
  );

  /**
   * DELETE /api/v1/students/enrollments/:enrollmentId
   * Remove student enrollment (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/enrollments/:enrollmentId', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => studentController.removeEnrollment(req, res, next)
  );

  /**
   * GET /api/v1/students/class/:classId
   * Get students by class (authenticated)
   */
  router.get('/class/:classId', authenticate, (req, res, next) => 
    studentController.getStudentsByClass(req, res, next)
  );

  return router;
};