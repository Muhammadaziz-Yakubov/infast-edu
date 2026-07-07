import { LeadRepository } from "../database/lead.repository";
import { CourseModel } from "../models/course.model";
import { CrmLeadModel } from "../models/crmLead.model";
import { UserModel } from "../models/user.model";
import { GroupModel } from "../models/group.model";
import { PaymentModel } from "../models/payment.model";
import { logger } from "../utils/logger";
import { Types } from "mongoose";

export class CRMService {
  private leadRepository: LeadRepository;
  private readonly keywords = ["kurs", "frontend", "backend", "flutter", "narx", "o'quv markaz"];

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  /**
   * Scans a message for CRM keywords and registers a lead in the local agent assistant logs
   */
  async processMessage(
    chatId: string,
    messageText: string,
    senderName: string,
    username: string
  ): Promise<boolean> {
    try {
      const textLower = messageText.toLowerCase();
      const matched = this.keywords.filter((keyword) => textLower.includes(keyword));

      if (matched.length > 0) {
        logger.info(`CRM Lead matched in chat ${chatId}. Keywords: [${matched.join(", ")}]`);

        await this.leadRepository.upsert(chatId, {
          name: senderName || "No Name",
          username: username || "",
          keywordsMatched: matched,
          lastMessage: messageText,
        });

        logger.info(`Saved/Updated lead for chat ${chatId} in local agent database.`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error in CRMService.processMessage: ${error}`);
      return false;
    }
  }

  /**
   * Registers a student directly in the CRM database (leads collection)
   */
  async addCrmLead(
    firstName: string,
    lastName: string,
    phone: string,
    courseName: string,
    chatId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(`Attempting to add CRM Lead: ${firstName} ${lastName} (${phone}) for ${courseName}`);

      // 1. Clean phone number (keep only digits and + symbol)
      const cleanPhone = phone.replace(/[^\d+]/g, "");

      // 2. Search for the interested course in courses collection
      const matchedCourse = await CourseModel.findOne({
        title: { $regex: new RegExp(courseName, "i") },
      });

      let interestedCourseId: Types.ObjectId | undefined;
      if (matchedCourse) {
        interestedCourseId = matchedCourse._id as Types.ObjectId;
        logger.info(`Matched course "${matchedCourse.title}" (ID: ${interestedCourseId})`);
      } else {
        logger.warn(`Could not find course matching "${courseName}" in database.`);
      }

      // 3. Check duplicate leads by phone number in CRM
      const existingLead = await CrmLeadModel.findOne({
        phone: cleanPhone,
        isDeleted: { $ne: true },
      });

      if (existingLead) {
        logger.info(`Lead with phone ${cleanPhone} already exists. Updating existing lead...`);
        existingLead.firstName = firstName;
        existingLead.lastName = lastName;
        if (interestedCourseId) {
          existingLead.interestedCourse = interestedCourseId;
        }
        existingLead.score += 5;
        if (!existingLead.tags.includes("AI_AGENT_UPDATE")) {
          existingLead.tags.push("AI_AGENT_UPDATE");
        }
        await existingLead.save();
        return {
          success: true,
          message: `Mavjud lead yangilandi (ID: ${existingLead._id})`,
        };
      }

      // 4. Create new lead in CRM database
      const newLead = new CrmLeadModel({
        firstName,
        lastName,
        phone: cleanPhone,
        interestedCourse: interestedCourseId,
        status: "NEW_LEAD",
        priority: "MEDIUM",
        score: 10,
        tags: ["AI_AGENT"],
        isDeleted: false,
        isArchived: false,
      });

      const saved = await newLead.save();
      logger.info(`Successfully saved new lead in CRM (ID: ${saved._id})`);

      return {
        success: true,
        message: `Yangi lead muvaffaqiyatli yaratildi (ID: ${saved._id})`,
      };
    } catch (error) {
      logger.error(`Error in CRMService.addCrmLead: ${error}`);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Get all leads from database
   */
  async getLeads() {
    return await this.leadRepository.findAll();
  }

  /**
   * Get total number of leads
   */
  async getLeadsCount(): Promise<number> {
    return await this.leadRepository.count();
  }

  /**
   * Fetches a student's profile, active group, schedule, and payment history using their phone number
   */
  async getStudentDataByPhone(phone: string): Promise<{
    success: boolean;
    studentName?: string;
    phone?: string;
    groupName?: string;
    scheduleDays?: string[];
    scheduleTime?: string;
    nextPaymentDate?: string;
    paymentHistory?: Array<{ amount: number; date: string; status: string; method: string }>;
    message?: string;
  }> {
    try {
      logger.info(`Searching CRM for student with phone: ${phone}`);
      const cleanPhone = phone.replace(/[^\d+]/g, "");

      const DAYS_UZ: Record<string, string> = {
        monday: "Dushanba",
        tuesday: "Seshanba",
        wednesday: "Chorshanba",
        thursday: "Payshanba",
        friday: "Juma",
        saturday: "Shanba",
        sunday: "Yakshanba",
      };

      // 1. Find User
      const user = await UserModel.findOne({
        $or: [
          { phone: cleanPhone },
          { studentPhone: cleanPhone }
        ],
        role: "STUDENT"
      });

      if (!user) {
        logger.warn(`No student found with phone ${cleanPhone}`);
        return {
          success: false,
          message: "Ushbu telefon raqamiga tegishli faol o'quvchi topilmadi. Iltimos, raqamni to'g'ri yozganingizga ishonch hosil qiling."
        };
      }

      // 2. Find their active Group
      const group = await GroupModel.findOne({
        students: user._id
      });

      let groupName = "Guruhga biriktirilmagan";
      let scheduleDays: string[] = [];
      let scheduleTime = "Noma'lum";

      if (group) {
        groupName = group.name;
        scheduleTime = group.schedule.time;
        scheduleDays = group.schedule.days.map(d => {
          const lower = d.toLowerCase();
          return DAYS_UZ[lower] || d;
        });
      }

      // 3. Find Payment history
      const payments = await PaymentModel.find({
        studentId: user._id
      }).sort({ paymentDate: -1 });

      let nextPaymentDateStr = "Noma'lum";
      const paymentHistory = payments.map((p) => {
        return {
          amount: p.amount,
          date: p.paymentDate.toISOString().split("T")[0],
          status: p.status,
          method: p.paymentMethod || "Click",
        };
      });

      if (payments.length > 0) {
        const latestPayment = payments[0];
        if (latestPayment.nextPaymentDate) {
          nextPaymentDateStr = latestPayment.nextPaymentDate.toISOString().split("T")[0];
        }
      }

      return {
        success: true,
        studentName: user.fullName,
        phone: user.phone,
        groupName,
        scheduleDays,
        scheduleTime,
        nextPaymentDate: nextPaymentDateStr,
        paymentHistory,
      };

    } catch (error) {
      logger.error(`Error in CRMService.getStudentDataByPhone: ${error}`);
      return {
        success: false,
        message: "Ma'lumotlarni olishda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring."
      };
    }
  }
}
