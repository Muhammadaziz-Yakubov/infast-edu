export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UPCOMING = 'UPCOMING',
  OVERDUE = 'OVERDUE',
  UNPAID = 'UNPAID',
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export enum NotificationType {
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  HOMEWORK_AVAILABLE = 'HOMEWORK_AVAILABLE',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}
