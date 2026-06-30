import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Connection, Types } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('InFast Academy OS Backend (e2e)', () => {
  let app: INestApplication<App>;
  let mongoConnection: Connection;
  let paymentsService: PaymentsService;

  // Global variables to store test objects across steps
  let adminToken: string;
  let studentToken: string;
  let studentUserId: string;
  let courseId: string;
  let moduleId: string;
  let lessonId: string;
  let homeworkId: string;
  let groupId: string;
  let rewardId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    mongoConnection = app.get<Connection>(getConnectionToken());
    paymentsService = app.get<PaymentsService>(PaymentsService);

    // Clear test database collections
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Seed admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    await mongoConnection.collection('users').insertOne({
      fullName: 'Super Admin',
      phone: '+998907777777',
      email: 'admin@infast.uz',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Login admin to generate adminToken
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: '+998907777777',
        password: 'AdminPassword123!',
      })
      .expect(201);

    adminToken = adminLoginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Clear database collections after all tests have run
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await app.close();
  });

  describe('1. Authentication & RBAC', () => {
    it('should create a student profile successfully (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'John Student',
          studentPhone: '+998901234567',
          parentPhone: '+998907654321',
          dateOfBirth: '27.09.2011',
          email: 'john@infast.uz',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.user.mustChangePassword).toBe(true);

      studentUserId = res.body.data.user._id;
    });

    it('should prevent registering duplicate student phone', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Duplicate Student',
          studentPhone: '+998901234567',
          parentPhone: '+998901111111',
          dateOfBirth: '15.08.2010',
        })
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should create a student profile successfully with a custom password', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Custom Password Student',
          studentPhone: '+998909876543',
          parentPhone: '+998909876544',
          dateOfBirth: '12.12.2012',
          email: 'custompass@infast.uz',
          password: 'SecretCustomPassword123!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.generatedPassword).toBe('SecretCustomPassword123!');

      // Login with the custom password
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: '+998909876543',
          password: 'SecretCustomPassword123!',
        })
        .expect(201);

      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.accessToken).toBeDefined();
    });

    it('should login student using phone and birthdate-based default password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: '+998901234567',
          password: '27092011',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.mustChangePassword).toBe(true);

      studentToken = res.body.data.accessToken;
    });

    it('should fail login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: '+998901234567',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should allow student to change password and mark mustChangePassword false', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          newPassword: 'NewSecurePassword123!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);

      // Verify login with new password and mustChangePassword is false
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: '+998901234567',
          password: 'NewSecurePassword123!',
        })
        .expect(201);

      expect(loginRes.body.data.user.mustChangePassword).toBe(false);
      studentToken = loginRes.body.data.accessToken; // update token
    });

    it('should restrict admin endpoints from student access (RBAC test)', async () => {
      // Trying to fetch users (Admin-only) as a Student
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Courses, LMS Modules, Lessons & Quizzes', () => {
    it('should create a course (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Fullstack JS Development',
          description: 'Master JavaScript and NestJS.',
          price: 500000,
          duration: '6 months',
          totalLessons: 114,
          level: 'Beginner',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      courseId = res.body.data._id;
    });

    it('should create a module for the course (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/lms/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'HTML & CSS Basics',
          order: 1,
          courseId,
        })
        .expect(201);

      moduleId = res.body.data._id;
      expect(moduleId).toBeDefined();
    });

    it('should create a lesson with quiz questions (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/lms/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'HTML Forms',
          description: 'Learn form elements.',
          videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
          order: 1,
          moduleId,
          textContent: 'Standard HTML Form structure includes form, input, select...',
          practiceTasks: ['Create form with text inputs', 'Add a submit button'],
          quiz: [
            {
              question: 'Which tag is used for form inputs?',
              options: ['<input>', '<form>', '<select>'],
              correctAnswerIndex: 0,
            },
            {
              question: 'What is the action attribute on form?',
              options: ['Destination URL', 'HTTP method', 'Form style'],
              correctAnswerIndex: 0,
            },
          ],
        })
        .expect(201);

      lessonId = res.body.data._id;
      expect(lessonId).toBeDefined();
    });

    it('should complete the lesson and award standard XP + perfect score bonus (Total: +100 XP)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/lms/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          quizAnswers: [0, 0], // Both correct answers
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.perfectScoreBonus).toBe(true);

      // Verify student profile updated with +100 XP
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.xp).toBe(100);
      expect(profileRes.body.data.level).toBe(1);
    });
  });

  describe('3. Homework System & Proportional Grading', () => {
    it('should create homework for the lesson (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/homework')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'HTML Forms homework',
          description: 'Submit inputs structure',
          lessonId,
          tasks: [
            {
              id: 'task_1',
              type: 'QUIZ',
              question: 'Which element is used to submit a form?',
              options: ['<button type="submit">', '<input type="text">'],
              correctAnswer: '<button type="submit">',
            },
            {
              id: 'task_2',
              type: 'TEXT',
              question: 'Name the method attribute values.',
              correctAnswer: 'GET and POST',
            },
          ],
          xpReward: 100,
          coinReward: 20,
        })
        .expect(201);

      homeworkId = res.body.data._id;
      expect(homeworkId).toBeDefined();
    });

    it('should submit homework answers and grade proportionally (1 task correct = 50%, awards +50 XP and +10 coins)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/homework/${homeworkId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [
            { taskId: 'task_1', answer: '<button type="submit">' }, // Correct
            { taskId: 'task_2', answer: 'Wrong text response' }, // Incorrect
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(50);
      expect(res.body.data.xpAwarded).toBe(50);
      expect(res.body.data.coinAwarded).toBe(10);

      // Check student profile: previous XP was 100, now should be 150. Coins should be 10.
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.xp).toBe(150);
      expect(profileRes.body.data.coins).toBe(10);
    });

    it('should block duplicate homework submissions (Exploit Prevention)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/homework/${homeworkId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [
            { taskId: 'task_1', answer: '<button type="submit">' },
            { taskId: 'task_2', answer: 'GET and POST' },
          ],
        })
        .expect(409); // Conflict

      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Automatic Lesson Scheduler (Weekday Date Calculation)', () => {
    it('should create a group, assign course, and calculate lesson schedule dates automatically', async () => {
      // Seed a few more lessons in modular curriculum so we have something to schedule
      await request(app.getHttpServer())
        .post('/lms/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Lesson 2: CSS Basics',
          videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
          order: 2,
          moduleId,
        });

      await request(app.getHttpServer())
        .post('/lms/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Lesson 3: Flexbox Grid',
          videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
          order: 3,
          moduleId,
        });

      // Group configuration:
      // Start Date: 2026-01-14 (Wednesday)
      // Days: Tuesday, Thursday, Saturday
      const res = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Group JS #101',
          courseId,
          schedule: {
            days: ['Tuesday', 'Thursday', 'Saturday'],
            time: '18:30 - 20:00',
          },
          startDate: '2026-01-14T00:00:00.000Z',
          endDate: '2026-07-14T00:00:00.000Z',
        })
        .expect(201);

      groupId = res.body.data._id;
      expect(groupId).toBeDefined();

      // Retrieve generated lesson schedule
      const scheduleRes = await request(app.getHttpServer())
        .get(`/groups/${groupId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(scheduleRes.body.data.length).toBe(3); // 3 lessons total in curriculum

      // Validate Weekdays Mapping:
      // Start date is Wed, Jan 14.
      // - 1st scheduled day matching: Thursday, Jan 15.
      // - 2nd scheduled day matching: Saturday, Jan 17.
      // - 3rd scheduled day matching: Tuesday, Jan 20.
      const date1 = new Date(scheduleRes.body.data[0].scheduledDate);
      const date2 = new Date(scheduleRes.body.data[1].scheduledDate);
      const date3 = new Date(scheduleRes.body.data[2].scheduledDate);

      expect(date1.getUTCDay()).toBe(4); // Thursday (4)
      expect(date1.getUTCDate()).toBe(15);
      expect(date2.getUTCDay()).toBe(6); // Saturday (6)
      expect(date2.getUTCDate()).toBe(17);
      expect(date3.getUTCDay()).toBe(2); // Tuesday (2)
      expect(date3.getUTCDate()).toBe(20);
    });

    it('should enroll a student in the group and link their profile', async () => {
      const res = await request(app.getHttpServer())
        .post(`/groups/${groupId}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.students).toContain(studentUserId);

      // Verify profile is updated
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.groupId._id).toBe(groupId);
      expect(profileRes.body.data.courseId._id).toBe(courseId);
    });
  });

  describe('5. Monthly Recurring Payments & Auto-Block Scenarios', () => {
    it('Scenario 1: Paid Payment Registration and 1-Month Next Due Date Calculation', async () => {
      // Register a payment of $49.99 for student
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
          amount: 49.99,
          transactionId: 'tx_test_123',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PAID');

      // Verify next payment date is exactly 1 month later
      const paymentDate = new Date(res.body.data.paymentDate);
      const nextPaymentDate = new Date(res.body.data.nextPaymentDate);

      const monthDiff = (nextPaymentDate.getFullYear() - paymentDate.getFullYear()) * 12 + (nextPaymentDate.getMonth() - paymentDate.getMonth());
      expect(monthDiff).toBe(1);

      // Verify student user status is ACTIVE and payment status is PAID
      const userRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(userRes.body.data.userId.status).toBe('ACTIVE');
      expect(userRes.body.data.paymentStatus).toBe('PAID');
    });

    it('Scenario 2: 5 Days Before Payment - status becomes UPCOMING with Notification', async () => {
      // Manually manipulate the latest payment nextPaymentDate to be 3 days in the future
      const threeDaysInFuture = new Date();
      threeDaysInFuture.setDate(threeDaysInFuture.getDate() + 3);

      await mongoConnection.collection('payments').updateOne(
        { studentId: new Types.ObjectId(studentUserId) },
        { $set: { nextPaymentDate: threeDaysInFuture } }
      );

      // Trigger status check manually
      await paymentsService.checkPaymentStatuses();

      // Check student profile: paymentStatus should now be UPCOMING
      const userRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(userRes.body.data.paymentStatus).toBe('UPCOMING');

      // Verify a reminder notification was created
      const notifRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(notifRes.body.data.some((n: any) => n.title.includes('Upcoming'))).toBe(true);
    });

    it('Scenario 3: Payment Deadline Reached - status becomes OVERDUE and Account becomes BLOCKED', async () => {
      // Manually manipulate the latest payment nextPaymentDate to be 1 day in the past
      const oneDayInPast = new Date();
      oneDayInPast.setDate(oneDayInPast.getDate() - 1);

      await mongoConnection.collection('payments').updateOne(
        { studentId: new Types.ObjectId(studentUserId) },
        { $set: { nextPaymentDate: oneDayInPast } }
      );

      // Trigger status check manually
      await paymentsService.checkPaymentStatuses();

      // Check student profile & user: paymentStatus should be OVERDUE, user status should be BLOCKED
      const userRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(userRes.body.data.paymentStatus).toBe('OVERDUE');
      expect(userRes.body.data.userId.status).toBe('BLOCKED');

      // Attempting to access auth-secured routes as student should be rejected if status is checked,
      // but let's check login rejection:
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'john@infast.uz',
          password: 'Password123!',
        })
        .expect(401);

      expect(loginRes.body.message).toContain('blocked');
    });

    it('Scenario 4: Overdue Payment Completed - status becomes PAID and Account reactivated to ACTIVE', async () => {
      // Register a payment to reactivate account
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
          amount: 49.99,
          transactionId: 'tx_reactivate',
        });

      if (res.status !== 201) {
        console.log('DEBUG PAYMENT REACTIVATE FAILED:', res.status, res.body);
      }
      expect(res.status).toBe(201);

      expect(res.body.success).toBe(true);

      // Check student profile: should be ACTIVE and PAID again
      const userRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(userRes.body.data.paymentStatus).toBe('PAID');
      expect(userRes.body.data.userId.status).toBe('ACTIVE');
    });
  });

  describe('6. Attendance & Exploit Prevention', () => {
    it('should mark student PRESENT and award +100 XP and +20 coins', async () => {
      // Current student stats before attendance: XP = 150, Coins = 10
      await request(app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
          groupId,
          lessonId,
          status: 'PRESENT',
        })
        .expect(201);

      // Verify student stats: XP = 250, Coins = 30
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.xp).toBe(250);
      expect(profileRes.body.data.coins).toBe(30);
      expect(profileRes.body.data.attendancePercentage).toBe(100);
    });

    it('should prevent repeated identical attendance submissions from duplicating XP rewards', async () => {
      // Mark present AGAIN for same lesson
      await request(app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
          groupId,
          lessonId,
          status: 'PRESENT',
        })
        .expect(201);

      // Stats should remain unchanged: XP = 250, Coins = 30
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.xp).toBe(250);
      expect(profileRes.body.data.coins).toBe(30);
    });

    it('should deduct penalities if presence is toggled to ABSENT (-300 XP, -70 Coins net delta to correct balance)', async () => {
      // Change to ABSENT
      await request(app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUserId,
          groupId,
          lessonId,
          status: 'ABSENT',
        })
        .expect(201);

      // Original base was XP = 150, Coins = 10.
      // PRESENT was +100 XP / +20 Coins (XP = 250, Coins = 30).
      // Now change to ABSENT: should be baseline (150, 10) - 200 XP / -50 Coins = -50 XP / -40 Coins.
      // Since negative balance is prevented and floors at 0: XP = 0 (max(0, -50) = 0), Coins = 0.
      // To test real deduction, let's look at the delta logic: xpDelta = -300, coinDelta = -70.
      // 250 - 300 = -50 (floored to 0), 30 - 70 = -40 (floored to 0).
      // Let's assert XP/Coins is floored at 0.
      const profileRes = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(profileRes.body.data.xp).toBe(0);
      expect(profileRes.body.data.coins).toBe(0);
      expect(profileRes.body.data.attendancePercentage).toBe(0); // 1 ABSENT, 0 PRESENT = 0%
    });
  });

  describe('7. Gamification Coin Market Shop', () => {
    it('should create reward in the shop (Admin only)', async () => {
      const res = await request(app.getHttpServer())
        .post('/market/rewards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Premium Stickers Pack',
          description: 'Fun stickers for your laptop.',
          coinPrice: 50,
          stock: 3,
        })
        .expect(201);

      rewardId = res.body.data._id;
      expect(rewardId).toBeDefined();
    });

    it('should reject purchase if student does not have enough coins', async () => {
      // Student currently has 0 coins
      const res = await request(app.getHttpServer())
        .post(`/market/rewards/${rewardId}/purchase`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient coins');
    });

    it('should successfully purchase reward if student has enough coins, decrementing stock', async () => {
      // Manually add 100 coins to student profile
      await mongoConnection.collection('studentprofiles').updateOne(
        { userId: new Types.ObjectId(studentUserId) },
        { $set: { coins: 100 } }
      );

      const res = await request(app.getHttpServer())
        .post(`/market/rewards/${rewardId}/purchase`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.remainingCoins).toBe(50);

      // Verify stock decremented to 2
      const rewardRes = await request(app.getHttpServer())
        .get(`/market/rewards/${rewardId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(rewardRes.body.data.stock).toBe(2);
    });
  });

  describe('8. Administrative Analytics Dashboard', () => {
    it('should retrieve aggregated metrics for admin dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.studentSummary).toBeDefined();
      expect(res.body.data.revenueSummary).toBeDefined();
      expect(res.body.data.paymentSummary).toBeDefined();
      expect(res.body.data.courses).toBeDefined();
    });
  });
});
