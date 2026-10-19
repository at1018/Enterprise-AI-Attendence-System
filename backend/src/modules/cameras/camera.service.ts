import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateCameraDto {
  name: string;
  cameraId: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  rtspUrl?: string;
  resolution?: string;
  fps?: number;
  classroomId?: string;
  tenantId: string;
}

export interface UpdateCameraDto {
  name?: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  rtspUrl?: string;
  resolution?: string;
  fps?: number;
  classroomId?: string;
  isActive?: boolean;
}

export class CameraService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new camera
   */
  async createCamera(data: CreateCameraDto) {
    // Check if camera ID already exists
    const existingCamera = await this.prisma.camera.findUnique({
      where: { cameraId: data.cameraId }
    });

    if (existingCamera) {
      throw new AppError(409, 'Camera with this ID already exists');
    }

    // Validate classroom if provided
    if (data.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: data.classroomId }
      });

      if (!classroom) {
        throw new AppError(404, 'Classroom not found');
      }

      if (classroom.tenantId !== data.tenantId) {
        throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
      }
    }

    // Create camera
    const camera = await this.prisma.camera.create({
      data: {
        name: data.name,
        cameraId: data.cameraId,
        ipAddress: data.ipAddress,
        port: data.port,
        username: data.username,
        password: data.password,
        rtspUrl: data.rtspUrl,
        resolution: data.resolution,
        fps: data.fps,
        classroomId: data.classroomId,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return camera;
  }

  /**
   * Get camera by ID
   */
  async getCameraById(id: string, tenantId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
      include: {
        classroom: true
      }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    return camera;
  }

  /**
   * Get camera by camera ID
   */
  async getCameraByCameraId(cameraId: string, tenantId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { cameraId },
      include: {
        classroom: true
      }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    return camera;
  }

  /**
   * Get all cameras for tenant
   */
  async getCamerasByTenant(tenantId: string, classroomId?: string) {
    const where: any = { tenantId };

    if (classroomId) {
      where.classroomId = classroomId;
    }

    const cameras = await this.prisma.camera.findMany({
      where,
      include: {
        classroom: true
      },
      orderBy: { name: 'asc' }
    });

    return cameras;
  }

  /**
   * Update camera
   */
  async updateCamera(id: string, data: UpdateCameraDto, tenantId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    // Validate classroom if provided
    if (data.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: data.classroomId }
      });

      if (!classroom) {
        throw new AppError(404, 'Classroom not found');
      }

      if (classroom.tenantId !== tenantId) {
        throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
      }
    }

    const updatedCamera = await this.prisma.camera.update({
      where: { id },
      data
    });

    return updatedCamera;
  }

  /**
   * Delete camera (soft delete by setting isActive to false)
   */
  async deleteCamera(id: string, tenantId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    // Soft delete
    await this.prisma.camera.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Camera deactivated successfully' };
  }

  /**
   * Assign camera to classroom
   */
  async assignToClassroom(cameraId: string, classroomId: string, tenantId: string) {
    // Validate camera exists
    const camera = await this.prisma.camera.findUnique({
      where: { id: cameraId }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    // Validate classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    // Update camera
    const updatedCamera = await this.prisma.camera.update({
      where: { id: cameraId },
      data: { classroomId }
    });

    return updatedCamera;
  }

  /**
   * Remove camera from classroom
   */
  async removeFromClassroom(cameraId: string, tenantId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id: cameraId }
    });

    if (!camera) {
      throw new AppError(404, 'Camera not found');
    }

    if (camera.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Camera belongs to different tenant');
    }

    const updatedCamera = await this.prisma.camera.update({
      where: { id: cameraId },
      data: { classroomId: null }
    });

    return updatedCamera;
  }
}