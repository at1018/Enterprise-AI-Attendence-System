import { Request, Response, NextFunction } from 'express';
import { TimetableService } from './timetable.service';
import { AppError } from '../../common/middleware/error.middleware';

export class TimetableController {
  private timetableService: TimetableService;

  constructor(timetableService: TimetableService) {
    this.timetableService = timetableService;
  }

  /**
   * Create a new timetable entry
   * POST /api/v1/timetable
   */
  async createTimetableEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timetableEntry = await this.timetableService.createTimetableEntry(req.body);

      res.status(201).json({
        success: true,
        message: 'Timetable entry created successfully',
        data: timetableEntry
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get timetable entry by ID
   * GET /api/v1/timetable/:id
   */
  async getTimetableEntryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const timetableEntry = await this.timetableService.getTimetableEntryById(id, tenantId);

      res.status(200).json({
        success: true,
        data: timetableEntry
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get timetable by class
   * GET /api/v1/timetable/class/:classId
   */
  async getTimetableByClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const timetableEntries = await this.timetableService.getTimetableByClass(
        classId,
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: timetableEntries,
        count: timetableEntries.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get timetable by teacher
   * GET /api/v1/timetable/teacher/:teacherId
   */
  async getTimetableByTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.params;
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const timetableEntries = await this.timetableService.getTimetableByTeacher(
        teacherId,
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: timetableEntries,
        count: timetableEntries.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get timetable by classroom
   * GET /api/v1/timetable/classroom/:classroomId
   */
  async getTimetableByClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classroomId } = req.params;
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const timetableEntries = await this.timetableService.getTimetableByClassroom(
        classroomId,
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: timetableEntries,
        count: timetableEntries.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update timetable entry
   * PUT /api/v1/timetable/:id
   */
  async updateTimetableEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const timetableEntry = await this.timetableService.updateTimetableEntry(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Timetable entry updated successfully',
        data: timetableEntry
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete timetable entry (soft delete)
   * DELETE /api/v1/timetable/:id
   */
  async deleteTimetableEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.timetableService.deleteTimetableEntry(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}