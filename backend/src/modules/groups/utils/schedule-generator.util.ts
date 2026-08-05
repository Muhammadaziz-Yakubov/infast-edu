export interface ScheduledLessonDate {
  order: number; // 1-indexed lesson order
  date: Date;
  formattedDate: string; // YYYY-MM-DD
}

export class ScheduleGenerator {
  private static DAY_MAP: Record<string, number> = {
    // English full & short
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
    // Uzbek full & short
    yakshanba: 0, yak: 0,
    dushanba: 1, du: 1,
    seshanba: 2, se: 2,
    chorshanba: 3, chor: 3,
    payshanba: 4, pay: 4,
    juma: 5, jum: 5,
    shanba: 6, sha: 6,
  };

  public static parseDayToUtcNumber(dayStr: string): number | null {
    if (!dayStr) return null;
    const clean = dayStr.trim().toLowerCase();
    if (this.DAY_MAP[clean] !== undefined) {
      return this.DAY_MAP[clean];
    }
    for (const [key, val] of Object.entries(this.DAY_MAP)) {
      if (clean.includes(key) || key.includes(clean)) {
        return val;
      }
    }
    return null;
  }

  public static generateDates(
    startDateInput: Date | string,
    daysOfWeekInput: string[],
    totalLessonsCount: number,
  ): ScheduledLessonDate[] {
    if (!startDateInput || totalLessonsCount <= 0) {
      return [];
    }

    const startDate = new Date(startDateInput);
    if (isNaN(startDate.getTime())) {
      return [];
    }

    const targetDayNumbers = (daysOfWeekInput || [])
      .map((d) => this.parseDayToUtcNumber(d))
      .filter((num): num is number => num !== null);

    const validDayNumbers = targetDayNumbers.length > 0 ? targetDayNumbers : [1, 3, 5];

    const result: ScheduledLessonDate[] = [];
    const currentDate = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
    );

    let order = 1;
    let maxIterations = totalLessonsCount * 14;
    let iteration = 0;

    while (order <= totalLessonsCount && iteration < maxIterations) {
      iteration++;
      const currentUtcDay = currentDate.getUTCDay();

      if (validDayNumbers.includes(currentUtcDay)) {
        const year = currentDate.getUTCFullYear();
        const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getUTCDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        result.push({
          order,
          date: new Date(currentDate),
          formattedDate,
        });

        order++;
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return result;
  }
}
