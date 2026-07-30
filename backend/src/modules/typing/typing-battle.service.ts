import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TypingBattle, TypingBattleDocument } from './schemas/typing-battle.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { StudentsService } from '../students/students.service';

const TYPING_TEXTS = [
  "InFast IT Academy is the leading coding school in our region. We teach Frontend, Backend, and Mobile App development.",
  "React Native allows developers to build high-performance mobile applications using JavaScript and React framework.",
  "NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.",
  "Gamification in education increases student engagement by introducing badges, leaderboards, and interactive battles.",
  "JavaScript is a versatile programming language that powers the interactive behavior of modern websites.",
  "TypeScript adds optional static typing to JavaScript, making it easier to catch errors during development.",
  "MongoDB is a document-based, distributed database designed for modern application developers and cloud era."
];

// Real-time waiting queue for typing battle matchmaking
interface WaitingPlayer {
  userId: string;
  studentId: string;
  fullName: string;
  avatar: string;
  wpm: number;
  timestamp: number;
}

const waitingPlayers: Map<string, WaitingPlayer> = new Map();

@Injectable()
export class TypingBattleService {
  constructor(
    @InjectModel(TypingBattle.name) private readonly typingBattleModel: Model<TypingBattleDocument>,
    @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly studentsService: StudentsService,
  ) {}

  async startBattle(userId: string) {
    const text = TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
    const now = Date.now();

    // Clean up stale queue items older than 30 seconds
    for (const [id, player] of waitingPlayers.entries()) {
      if (now - player.timestamp > 30000) {
        waitingPlayers.delete(id);
      }
    }

    // Check if there is another real waiting player in queue (not the current user)
    let realOpponent: WaitingPlayer | undefined;
    for (const [id, player] of waitingPlayers.entries()) {
      if (id !== userId) {
        realOpponent = player;
        waitingPlayers.delete(id); // Paired up!
        break;
      }
    }

    let opponentData: any;

    if (realOpponent) {
      // Real student matched!
      opponentData = {
        _id: realOpponent.studentId,
        fullName: realOpponent.fullName,
        avatar: realOpponent.avatar,
        wpm: realOpponent.wpm,
        accuracy: 95,
        isAi: false,
      };
    } else {
      // Fetch current student profile to register in queue for future real opponents
      const currentProfile = await this.studentProfileModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .populate('userId', 'fullName avatar')
        .exec();

      if (currentProfile) {
        const cUser = currentProfile.userId as any;
        waitingPlayers.set(userId, {
          userId,
          studentId: currentProfile._id.toString(),
          fullName: cUser?.fullName || 'Talaba',
          avatar: cUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cUser?.fullName || 'Talaba'}`,
          wpm: Math.floor(Math.random() * 25) + 40,
          timestamp: now,
        });
      }

      // Try finding another student profile in DB or create an AI Bot opponent
      const dbOpponent = await this.studentProfileModel.findOne({
        userId: { $ne: new Types.ObjectId(userId) }
      }).populate('userId', 'fullName avatar').exec();

      // If random choice allows or no DB opponent, assign AI Bot
      const useAi = Math.random() > 0.4 || !dbOpponent;

      if (useAi || !dbOpponent) {
        const botNames = ['⚡ SpeedBot AI', '🤖 TurboTypist AI', '🔥 CodeRacer AI', '⚡ CyberTypist AI'];
        const randomName = botNames[Math.floor(Math.random() * botNames.length)];
        opponentData = {
          _id: new Types.ObjectId().toString(),
          fullName: randomName,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(randomName)}`,
          wpm: Math.floor(Math.random() * 25) + 45, // 45-70 WPM
          accuracy: Math.floor(Math.random() * 5) + 94,
          isAi: true,
        };
      } else {
        const user = dbOpponent.userId as any;
        opponentData = {
          _id: dbOpponent._id.toString(),
          fullName: user?.fullName || 'Talaba',
          avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Talaba'}`,
          wpm: Math.floor(Math.random() * 30) + 40, // 40-70 WPM
          accuracy: Math.floor(Math.random() * 10) + 88,
          isAi: false,
        };
      }
    }

    return {
      text,
      opponent: opponentData,
    };
  }

  async saveResult(userId: string, body: any) {
    const student = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const { opponentId, wpm, accuracy, score, result } = body;
    
    let xpChange = 20; // default DRAW
    if (result === 'WIN') {
      xpChange = 100;
    } else if (result === 'LOSE') {
      xpChange = -20;
    }

    const battle = new this.typingBattleModel({
      studentId: student._id,
      opponentId: new Types.ObjectId(opponentId),
      text: body.text || 'Simulated battle text',
      wpm,
      accuracy,
      score,
      result,
      xpChange
    });
    await battle.save();

    // Update student's XP & Level
    const updatedStudent = await this.studentsService.addXpAndCoins(userId, xpChange, 0);

    return {
      success: true,
      xpChange,
      newXp: updatedStudent.xp,
      newLevel: updatedStudent.level
    };
  }

  async getLeaderboard() {
    // Aggregate to find wins, maxWpm for each student
    const stats = await this.typingBattleModel.aggregate([
      {
        $group: {
          _id: '$studentId',
          maxWpm: { $max: '$wpm' },
          wins: {
            $sum: {
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0]
            }
          }
        }
      }
    ]).exec();

    const leaderboard = [];
    for (const stat of stats) {
      const student = await this.studentProfileModel.findById(stat._id).populate('userId', 'fullName avatar').exec();
      if (student) {
        const user = student.userId as any;
        leaderboard.push({
          _id: student._id.toString(),
          fullName: user?.fullName || 'Talaba',
          avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Talaba'}`,
          wpm: stat.maxWpm || 0,
          wins: stat.wins || 0,
          xp: student.xp || 0
        });
      }
    }

    // Add remaining students as mocks to look realistic
    if (leaderboard.length < 5) {
      const allStudents = await this.studentProfileModel.find().populate('userId', 'fullName avatar').exec();
      for (const student of allStudents) {
        if (leaderboard.some(l => l._id === student._id.toString())) continue;
        const user = student.userId as any;
        leaderboard.push({
          _id: student._id.toString(),
          fullName: user?.fullName || 'Talaba',
          avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Talaba'}`,
          wpm: Math.floor(Math.random() * 25) + 35, // 35 - 60 WPM
          wins: Math.floor(Math.random() * 5) + 2, // 2 - 7 Wins
          xp: student.xp || 0
        });
      }
    }

    leaderboard.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.xp - a.xp;
    });

    return leaderboard;
  }
}
