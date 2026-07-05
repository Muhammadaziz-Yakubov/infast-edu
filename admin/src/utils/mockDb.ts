// Persistent local storage fallback database for development and demo mode
export interface Student {
  _id: string;
  fullName: string;
  studentPhone: string;
  parentPhone: string;
  dateOfBirth: string;
  email?: string;
  avatar?: string;
  role: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  groupId?: string;
  courseId?: string;
  xp: number;
  coins: number;
  level: number;
  paymentStatus: 'PAID' | 'UPCOMING' | 'OVERDUE' | 'UNPAID';
  mustChangePassword?: boolean;
  attendancePercentage?: number;
  homeworkProgress?: number;
  label?: string;
}

export interface Group {
  _id: string;
  name: string;
  courseId: string;
  students: string[];
  schedule: {
    days: string[];
    time: string;
  };
  startDate: string;
  endDate: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  duration: string;
  level: string;
  status: 'ACTIVE' | 'DRAFT';
  modules: any[];
}

export interface HomeworkSubmission {
  _id: string;
  studentId: string;
  studentName: string;
  studentLabel?: string;
  homeworkId: string;
  homeworkTitle: string;
  score: number;
  status: 'PENDING' | 'GRADED';
  completedAt: string;
}

export interface Payment {
  _id: string;
  studentId: string;
  studentName: string;
  studentLabel?: string;
  amount: number;
  paymentDate: string;
  nextPaymentDate: string;
  status: 'PAID' | 'UPCOMING' | 'OVERDUE' | 'UNPAID';
  transactionId?: string;
}

export interface Reward {
  _id: string;
  name: string;
  description: string;
  image?: string;
  coinPrice: number;
  stock: number;
}

const INITIAL_COURSES: Course[] = [
  {
    _id: 'c1',
    title: 'Fullstack JS Development',
    description: 'Master JavaScript, NestJS, and React from scratch.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=400&h=250&q=80',
    price: 500000,
    duration: '6 months',
    level: 'Beginner',
    status: 'ACTIVE',
    modules: [
      {
        _id: 'm1',
        title: 'Module 1: JavaScript Fundamentals',
        order: 1,
        lessons: [
          { _id: 'l1', title: 'Variables & Data Types', order: 1, videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
          { _id: 'l2', title: 'Functions & Scope', order: 2, videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk' }
        ]
      }
    ]
  },
  {
    _id: 'c2',
    title: 'Python for AI & Data Science',
    description: 'Learn Python, Pandas, and deep learning algorithms.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&h=250&q=80',
    price: 600000,
    duration: '4 months',
    level: 'Intermediate',
    status: 'ACTIVE',
    modules: []
  }
];

const INITIAL_GROUPS: Group[] = [
  {
    _id: 'g1',
    name: 'Frontend Beginner #1',
    courseId: 'c1',
    students: ['s1', 's2'],
    schedule: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      time: '18:30 - 20:00'
    },
    startDate: '2026-06-01',
    endDate: '2026-12-01'
  }
];

const INITIAL_STUDENTS: Student[] = [
  {
    _id: 's1',
    fullName: 'John Student',
    studentPhone: '+998901234567',
    parentPhone: '+998907654321',
    dateOfBirth: '27.09.2011',
    email: 'john@infast.uz',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
    role: 'STUDENT',
    status: 'ACTIVE',
    groupId: 'g1',
    courseId: 'c1',
    xp: 1250,
    coins: 450,
    level: 2,
    paymentStatus: 'PAID',
    mustChangePassword: false
  },
  {
    _id: 's2',
    fullName: 'Sara Miller',
    studentPhone: '+998909876543',
    parentPhone: '+998901112233',
    dateOfBirth: '15.08.2010',
    email: 'sara@infast.uz',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sara',
    role: 'STUDENT',
    status: 'ACTIVE',
    groupId: 'g1',
    courseId: 'c1',
    xp: 850,
    coins: 120,
    level: 1,
    paymentStatus: 'UPCOMING',
    mustChangePassword: true
  },
  {
    _id: 's3',
    fullName: 'Diyor Kadirov',
    studentPhone: '+998935554433',
    parentPhone: '+998939998877',
    dateOfBirth: '05.12.2009',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Diyor',
    role: 'STUDENT',
    status: 'BLOCKED',
    xp: 2200,
    coins: 30,
    level: 3,
    paymentStatus: 'OVERDUE',
    mustChangePassword: false
  }
];

const INITIAL_REWARDS: Reward[] = [
  { _id: 'r1', name: 'InFast Hoody', description: 'Premium black cotton hoodie with golden branding.', coinPrice: 500, stock: 8 },
  { _id: 'r2', name: 'Developer Mug', description: 'Thermal ceramic mug with InFast Academy logo.', coinPrice: 150, stock: 25 },
  { _id: 'r3', name: 'Sticker Pack', description: 'Awesome coding stickers for laptops.', coinPrice: 50, stock: 100 }
];

const INITIAL_PAYMENTS: Payment[] = [
  { _id: 'p1', studentId: 's1', studentName: 'John Student', amount: 49.99, paymentDate: '2026-06-01', nextPaymentDate: '2026-07-01', status: 'PAID', transactionId: 'tx_local_1' },
  { _id: 'p2', studentId: 's2', studentName: 'Sara Miller', amount: 49.99, paymentDate: '2026-05-28', nextPaymentDate: '2026-06-28', status: 'UPCOMING' },
  { _id: 'p3', studentId: 's3', studentName: 'Diyor Kadirov', amount: 49.99, paymentDate: '2026-05-10', nextPaymentDate: '2026-06-10', status: 'OVERDUE' }
];

const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  { _id: 'sub1', studentId: 's1', studentName: 'John Student', homeworkId: 'hw1', homeworkTitle: 'Variables Practice', score: 85, status: 'GRADED', completedAt: '2026-06-20T14:30:00Z' },
  { _id: 'sub2', studentId: 's2', studentName: 'Sara Miller', homeworkId: 'hw1', homeworkTitle: 'Variables Practice', score: 100, status: 'GRADED', completedAt: '2026-06-21T09:15:00Z' }
];

// Helper to initialize and retrieve mock database tables
class MockDb {
  private getTable<T>(name: string, fallback: T[]): T[] {
    const data = localStorage.getItem(`mock_db_${name}`);
    if (!data) {
      localStorage.setItem(`mock_db_${name}`, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  }

  private saveTable<T>(name: string, data: T[]) {
    localStorage.setItem(`mock_db_${name}`, JSON.stringify(data));
  }

  get students(): Student[] { return this.getTable('students', INITIAL_STUDENTS); }
  set students(data: Student[]) { this.saveTable('students', data); }

  get groups(): Group[] { return this.getTable('groups', INITIAL_GROUPS); }
  set groups(data: Group[]) { this.saveTable('groups', data); }

  get courses(): Course[] { return this.getTable('courses', INITIAL_COURSES); }
  set courses(data: Course[]) { this.saveTable('courses', data); }

  get rewards(): Reward[] { return this.getTable('rewards', INITIAL_REWARDS); }
  set rewards(data: Reward[]) { this.saveTable('rewards', data); }

  get payments(): Payment[] { return this.getTable('payments', INITIAL_PAYMENTS); }
  set payments(data: Payment[]) { this.saveTable('payments', data); }

  get submissions(): HomeworkSubmission[] { return this.getTable('submissions', INITIAL_SUBMISSIONS); }
  set submissions(data: HomeworkSubmission[]) { this.saveTable('submissions', data); }
}

export const mockDb = new MockDb();
