import { Router } from 'express';
import { TeacherController } from './teacher.controller';
import { validate } from '../../common/utils/validation.util';
import { createTeacherSchema, updateTeacherSchema, classAssignmentSchema, subjectAssignmentSchema } from './dto/teacher.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createTeacherRoutes = (teacherController: TeacherController): Router => {
  const router = Router();

  /**
   * POST /api/v1/teachers
   * Create a new teacher (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createTeacherSchema),
    (req, res, next) => teacherController.createTeacher(req, res, next)
  );

  /**
   * GET /api/v1/teachers
   * Get all teachers for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    teacherController.getTeachers(req, res, next)
  );

  /**
   * GET /api/v1/teachers/:id
   * Get teacher by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    teacherController.getTeacherById(req, res, next)
  );

  /**
   * GET /api/v1/teachers/teacher/:teacherId
   * Get teacher by teacher ID (authenticated)
   */
  router.get('/teacher/:teacherId', authenticate, (req, res, next) => 
    teacherController.getTeacherByTeacherId(req, res, next)
  );

  /**
   * PUT /api/v1/teachers/:id
   * Update teacher (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateTeacherSchema),
    (req, res, next) => teacherController.updateTeacher(req, res, next)
  );

  /**
   * DELETE /api/v1/teachers/:id
   * Delete teacher (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => teacherController.deleteTeacher(req, res, next)
  );

  /**
   * POST /api/v1/teachers/assign-class
   * Assign teacher to class (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/assign-class', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(classAssignmentSchema),
    (req, res, next) => teacherController.assignToClass(req, res, next)
  );

  /**
   * POST /api/v1/teachers/assign-subject
   * Assign teacher to subject (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/assign-subject', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(subjectAssignmentSchema),
    (req, res, next) => teacherController.assignToSubject(req, res, next)
  );

  /**
   * DELETE /api/v1/teachers/class-assignments/:assignmentId
   * Remove class assignment (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/class-assignments/:assignmentId', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => teacherController.removeClassAssignment(req, res, next)
  );

  /**
   * DELETE /api/v1/teachers/subject-assignments/:assignmentId
   * Remove subject assignment (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/subject-assignments/:assignmentId', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => teacherController.removeSubjectAssignment(req, res, next)
  );

  return router;
};