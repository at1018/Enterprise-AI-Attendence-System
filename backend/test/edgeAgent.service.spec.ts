import { PrismaClient } from '@prisma/client';
import { EdgeDeviceService } from '../src/modules/edgeAgent/edgeDevice.service';
import { EdgeEventService } from '../src/modules/edgeAgent/edgeEvent.service';

describe('Phase 6: Edge Agent Services', () => {
  let prisma: PrismaClient;
  let edgeDeviceService: EdgeDeviceService;
  let edgeEventService: EdgeEventService;
  let testTenantId: string;
  let testDeviceId: string;
  let testEventId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    edgeDeviceService = new EdgeDeviceService(prisma);
    edgeEventService = new EdgeEventService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Phase 6 Test School',
        slug: 'phase6-edge-test-school',
        schemaName: 'school_phase6_edge_test',
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
  });

  afterAll(async () => {
    // Cleanup
    await prisma.edgeEvent.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.edgeDevice.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.tenant.delete({
      where: { id: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('EdgeDeviceService', () => {
    it('should register a new edge device', async () => {
      const device = await edgeDeviceService.registerDevice({
        deviceId: 'edge-device-001',
        deviceName: 'Classroom Camera 1',
        tenantId: testTenantId,
        status: 'ONLINE',
        authCredential: 'test-credential-123'
      });

      expect(device).toBeDefined();
      expect(device.deviceId).toBe('edge-device-001');
      expect(device.deviceName).toBe('Classroom Camera 1');
      expect(device.tenantId).toBe(testTenantId);
      expect(device.status).toBe('ONLINE');
      testDeviceId = device.deviceId;
    });

    it('should update existing device on re-registration', async () => {
      const updatedDevice = await edgeDeviceService.registerDevice({
        deviceId: 'edge-device-001',
        deviceName: 'Classroom Camera 1 Updated',
        tenantId: testTenantId,
        status: 'OFFLINE'
      });

      expect(updatedDevice).toBeDefined();
      expect(updatedDevice.deviceName).toBe('Classroom Camera 1 Updated');
      expect(updatedDevice.status).toBe('OFFLINE');
    });

    it('should get device by device ID', async () => {
      const device = await edgeDeviceService.getDeviceByDeviceId('edge-device-001', testTenantId);

      expect(device).toBeDefined();
      expect(device.deviceId).toBe('edge-device-001');
      expect(device.tenantId).toBe(testTenantId);
    });

    it('should reject device from different tenant', async () => {
      await expect(
        edgeDeviceService.getDeviceByDeviceId('edge-device-001', 'different-tenant-id')
      ).rejects.toThrow('Access denied: Device belongs to different tenant');
    });

    it('should get all devices for tenant', async () => {
      // Create another device
      await edgeDeviceService.registerDevice({
        deviceId: 'edge-device-002',
        deviceName: 'Classroom Camera 2',
        tenantId: testTenantId
      });

      const devices = await edgeDeviceService.getDevicesByTenant(testTenantId);

      expect(devices).toBeDefined();
      expect(devices.length).toBeGreaterThanOrEqual(2);
    });

    it('should update device status', async () => {
      const updatedDevice = await edgeDeviceService.updateDeviceStatus('edge-device-001', 'MAINTENANCE', testTenantId);

      expect(updatedDevice).toBeDefined();
      expect(updatedDevice.status).toBe('MAINTENANCE');
    });

    it('should delete device', async () => {
      await edgeDeviceService.registerDevice({
        deviceId: 'edge-device-temp',
        deviceName: 'Temporary Device',
        tenantId: testTenantId
      });

      const result = await edgeDeviceService.deleteDevice('edge-device-temp', testTenantId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Device deleted successfully');
    });
  });

  describe('EdgeEventService', () => {
    it('should create a new edge event', async () => {
      const event = await edgeEventService.createEvent({
        eventId: 'event-001',
        eventType: 'CAMERA_FRAME',
        deviceId: testDeviceId,
        tenantId: testTenantId,
        timestamp: new Date(),
        data: { frameData: 'sample-frame-data' }
      });

      expect(event).toBeDefined();
      expect(event.eventId).toBe('event-001');
      expect(event.eventType).toBe('CAMERA_FRAME');
      expect(event.deviceId).toBe(testDeviceId);
      expect(event.tenantId).toBe(testTenantId);
      expect(event.synced).toBe(true);
      testEventId = event.eventId;
    });

    it('should handle idempotency - return existing event', async () => {
      const event = await edgeEventService.createEvent({
        eventId: 'event-001',
        eventType: 'CAMERA_FRAME',
        deviceId: testDeviceId,
        tenantId: testTenantId,
        timestamp: new Date(),
        data: { frameData: 'different-data' }
      });

      expect(event).toBeDefined();
      expect(event.eventId).toBe('event-001');
      // Should return the existing event, not create a new one
    });

    it('should get event by event ID', async () => {
      const event = await edgeEventService.getEventByEventId('event-001', testTenantId);

      expect(event).toBeDefined();
      expect(event.eventId).toBe('event-001');
      expect(event.tenantId).toBe(testTenantId);
    });

    it('should reject event from different tenant', async () => {
      await expect(
        edgeEventService.getEventByEventId('event-001', 'different-tenant-id')
      ).rejects.toThrow('Access denied: Event belongs to different tenant');
    });

    it('should get events by device', async () => {
      // Create another event
      await edgeEventService.createEvent({
        eventId: 'event-002',
        eventType: 'CAMERA_STATUS',
        deviceId: testDeviceId,
        tenantId: testTenantId,
        timestamp: new Date(),
        data: { status: 'ONLINE' }
      });

      const events = await edgeEventService.getEventsByDevice(testDeviceId, testTenantId);

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    it('should get events by tenant', async () => {
      const events = await edgeEventService.getEventsByTenant(testTenantId);

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    it('should get events by event type', async () => {
      const events = await edgeEventService.getEventsByTenant(testTenantId, 'CAMERA_FRAME');

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].eventType).toBe('CAMERA_FRAME');
    });

    it('should mark event as synced', async () => {
      // Create an unsynced event
      await edgeEventService.createEvent({
        eventId: 'event-003',
        eventType: 'ATTENDANCE_DETECTED',
        deviceId: testDeviceId,
        tenantId: testTenantId,
        timestamp: new Date(),
        data: { studentId: 'student-123' }
      });

      const updatedEvent = await edgeEventService.markEventSynced('event-003', testTenantId);

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.synced).toBe(true);
    });

    it('should increment retry count', async () => {
      const updatedEvent = await edgeEventService.incrementRetryCount('event-003', testTenantId);

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.retryCount).toBe(1);
    });

    it('should delete event', async () => {
      await edgeEventService.createEvent({
        eventId: 'event-temp',
        eventType: 'TEMP_EVENT',
        deviceId: testDeviceId,
        tenantId: testTenantId,
        timestamp: new Date(),
        data: { temp: true }
      });

      const result = await edgeEventService.deleteEvent('event-temp', testTenantId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Event deleted successfully');
    });
  });
});
