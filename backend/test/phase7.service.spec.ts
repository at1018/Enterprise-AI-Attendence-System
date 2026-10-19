import { PrismaClient } from '@prisma/client';
import { FaceEnrollmentService } from '../src/modules/faceRecognition/faceEnrollment.service';
import { BiometricConsentService } from '../src/modules/faceRecognition/biometricConsent.service';
import { FaceRecognitionResultService } from '../src/modules/faceRecognition/faceRecognitionResult.service';

describe('Phase 7: Face Recognition Services', () => {
  let prisma: PrismaClient;
  let faceEnrollmentService: FaceEnrollmentService;
  let biometricConsentService: BiometricConsentService;
  let faceRecognitionResultService: FaceRecognitionResultService;
  let testTenantId: string;
  let testStudentId: string;
  let testEnrollmentId: string;
  let testConsentId: string;
  let testAcademicYearId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    faceEnrollmentService = new FaceEnrollmentService(prisma);
    biometricConsentService = new BiometricConsentService(prisma);
    faceRecognitionResultService = new FaceRecognitionResultService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Phase 7 Test School',
        slug: 'phase7-face-test-school',
        schemaName: 'school_phase7_face_test',
        status: 'ACTIVE',
        configuration: {
          create: {
            maxUsers: 100,
            maxStudents: 1000,
            maxTeachers: 100,
            features: []
          }
        }
      }
    });
    testTenantId = tenant.id;

    // Create a test academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        tenantId: testTenantId
      }
    });
    testAcademicYearId = academicYear.id;

    // Create a test class
    const testClass = await prisma.class.create({
      data: {
        name: 'Test Class 10A',
        grade: 10,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });

    // Create a test student
    const student = await prisma.student.create({
      data: {
        studentId: 'STU-2024-001',
        firstName: 'John',
        lastName: 'Doe',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });
    testStudentId = student.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.faceRecognitionResult.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.faceEnrollment.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.biometricConsent.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.student.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.class.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.academicYear.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.tenant.delete({
      where: { id: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('BiometricConsentService', () => {
    it('should give biometric consent for a student', async () => {
      const consent = await biometricConsentService.giveConsent({
        studentId: testStudentId,
        tenantId: testTenantId,
        consentGiven: true,
        consentedBy: 'admin-user-001',
        consentMethod: 'digital_form',
        notes: 'Parent consent obtained'
      });

      expect(consent).toBeDefined();
      expect(consent.studentId).toBe(testStudentId);
      expect(consent.tenantId).toBe(testTenantId);
      expect(consent.consentGiven).toBe(true);
      testConsentId = consent.id;
    });

    it('should get consent by student ID', async () => {
      const consent = await biometricConsentService.getConsentByStudent(testStudentId, testTenantId);

      expect(consent).toBeDefined();
      expect(consent.studentId).toBe(testStudentId);
      expect(consent.tenantId).toBe(testTenantId);
    });

    it('should reject consent from different tenant', async () => {
      await expect(
        biometricConsentService.getConsentByStudent(testStudentId, 'different-tenant-id')
      ).rejects.toThrow('Biometric consent not found');
    });

    it('should get all consents for tenant', async () => {
      const consents = await biometricConsentService.getConsentsByTenant(testTenantId);

      expect(consents).toBeDefined();
      expect(consents.length).toBeGreaterThanOrEqual(1);
    });

    it('should withdraw biometric consent', async () => {
      const consent = await biometricConsentService.withdrawConsent(testStudentId, testTenantId, 'admin-user-001');

      expect(consent).toBeDefined();
      expect(consent.consentGiven).toBe(false);
      expect(consent.withdrawnAt).toBeDefined();
    });
  });

  describe('FaceEnrollmentService', () => {
    beforeAll(async () => {
      // Re-give consent for enrollment tests
      await biometricConsentService.giveConsent({
        studentId: testStudentId,
        tenantId: testTenantId,
        consentGiven: true,
        consentedBy: 'admin-user-001',
        consentMethod: 'digital_form'
      });
    });

    it('should enroll a face for a student', async () => {
      const faceEmbedding = Array(128).fill(0.5); // Placeholder 128D embedding
      const tenantSecret = 'test-tenant-secret-key';

      const enrollment = await faceEnrollmentService.enrollFace({
        studentId: testStudentId,
        tenantId: testTenantId,
        faceEmbedding,
        qualityScore: 0.95,
        deviceId: 'edge-device-001',
        tenantSecret
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentId);
      expect(enrollment.tenantId).toBe(testTenantId);
      expect(enrollment.qualityScore).toBe(0.95);
      expect(enrollment.isActive).toBe(true);
      testEnrollmentId = enrollment.id;
    });

    it('should get enrollment by student ID', async () => {
      const tenantSecret = 'test-tenant-secret-key';
      const enrollment = await faceEnrollmentService.getEnrollmentByStudent(testStudentId, testTenantId, tenantSecret);

      expect(enrollment).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentId);
      expect(enrollment.tenantId).toBe(testTenantId);
      expect(Array.isArray(enrollment.faceEmbedding)).toBe(true);
      expect(enrollment.faceEmbedding.length).toBe(128);
    });

    it('should reject enrollment from different tenant', async () => {
      const tenantSecret = 'test-tenant-secret-key';
      await expect(
        faceEnrollmentService.getEnrollmentByStudent(testStudentId, 'different-tenant-id', tenantSecret)
      ).rejects.toThrow('Face enrollment not found');
    });

    it('should get all enrollments for tenant', async () => {
      const enrollments = await faceEnrollmentService.getEnrollmentsByTenant(testTenantId);

      expect(enrollments).toBeDefined();
      expect(enrollments.length).toBeGreaterThanOrEqual(1);
    });

    it('should deactivate face enrollment', async () => {
      const enrollment = await faceEnrollmentService.deactivateEnrollment(testStudentId, testTenantId);

      expect(enrollment).toBeDefined();
      expect(enrollment.isActive).toBe(false);
    });

    it('should delete face enrollment with audit trail', async () => {
      // Re-activate enrollment for deletion test
      await faceEnrollmentService.enrollFace({
        studentId: testStudentId,
        tenantId: testTenantId,
        faceEmbedding: Array(128).fill(0.5),
        qualityScore: 0.95,
        tenantSecret: 'test-tenant-secret-key'
      });

      const result = await faceEnrollmentService.deleteEnrollment(
        testStudentId,
        testTenantId,
        'admin-user-001',
        'Student requested deletion',
        'SCHOOL_ADMIN'
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Face enrollment deleted successfully');

      // Verify audit record was created
      const auditRecords = await prisma.biometricDeletionAudit.findMany({
        where: { tenantId: testTenantId }
      });

      expect(auditRecords.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('FaceRecognitionResultService', () => {
    beforeAll(async () => {
      // Re-enroll face for recognition tests
      await biometricConsentService.giveConsent({
        studentId: testStudentId,
        tenantId: testTenantId,
        consentGiven: true,
        consentedBy: 'admin-user-001',
        consentMethod: 'digital_form'
      });

      const enrollment = await faceEnrollmentService.enrollFace({
        studentId: testStudentId,
        tenantId: testTenantId,
        faceEmbedding: Array(128).fill(0.5),
        qualityScore: 0.95,
        tenantSecret: 'test-tenant-secret-key'
      });
      testEnrollmentId = enrollment.id;
    });

    it('should create a face recognition result', async () => {
      const tenantSecret = 'test-tenant-secret-key';

      const result = await faceRecognitionResultService.createRecognitionResult({
        enrollmentId: testEnrollmentId,
        tenantId: testTenantId,
        deviceId: 'edge-device-001',
        confidence: 0.98,
        faceQuality: 0.92,
        tenantSecret
      });

      expect(result).toBeDefined();
      expect(result.enrollmentId).toBe(testEnrollmentId);
      expect(result.tenantId).toBe(testTenantId);
      expect(result.confidence).toBe(0.98);
    });

    it('should get recognition results by tenant', async () => {
      const results = await faceRecognitionResultService.getResultsByTenant(testTenantId);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should get recognition results by student', async () => {
      const results = await faceRecognitionResultService.getResultsByStudent(testStudentId, testTenantId);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should get recognition results by device', async () => {
      const results = await faceRecognitionResultService.getResultsByDevice('edge-device-001', testTenantId);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
});
