export interface ITelegramBotService {
  /**
   * Send a notification when a new payment is created
   */
  notifyPaymentCreated(paymentData: any): Promise<void>;

  /**
   * Send a notification when a payment is cancelled
   */
  notifyPaymentCancelled(paymentData: any): Promise<void>;

  /**
   * Send a notification when a payment is edited
   */
  notifyPaymentEdited(paymentData: any): Promise<void>;

  /**
   * Send a notification when a student is blocked
   */
  notifyStudentBlocked(studentData: any): Promise<void>;

  /**
   * Send a notification when a student is unblocked
   */
  notifyStudentUnblocked(studentData: any): Promise<void>;

  /**
   * Send a notification when a new student is registered
   */
  notifyStudentCreated(studentData: any): Promise<void>;

  /**
   * Send a notification when a student is deleted
   */
  notifyStudentDeleted(studentData: any): Promise<void>;

  /**
   * Send a report document (PDF/Excel) to a director's Telegram chat
   */
  sendReportFile(chatId: string, format: 'pdf' | 'excel', period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<void>;

  /**
   * Generate raw Excel report buffer
   */
  generateReportExcelBuffer(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<Buffer>;

  /**
   * Generate raw PDF report buffer
   */
  generateReportPdfBuffer(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<Buffer>;
}
