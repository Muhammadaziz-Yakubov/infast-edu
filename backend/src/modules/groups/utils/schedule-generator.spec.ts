import { ScheduleGenerator } from './schedule-generator.util';

describe('ScheduleGenerator', () => {
  it('should parse day names in English and Uzbek', () => {
    expect(ScheduleGenerator.parseDayToUtcNumber('MONDAY')).toBe(1);
    expect(ScheduleGenerator.parseDayToUtcNumber('Dushanba')).toBe(1);
    expect(ScheduleGenerator.parseDayToUtcNumber('tue')).toBe(2);
    expect(ScheduleGenerator.parseDayToUtcNumber('chorshanba')).toBe(3);
    expect(ScheduleGenerator.parseDayToUtcNumber('FRIDAY')).toBe(5);
  });

  it('should generate correct sequence for MWF starting 2026-07-10', () => {
    // 2026-07-10 is a Friday
    const dates = ScheduleGenerator.generateDates('2026-07-10', ['MONDAY', 'WEDNESDAY', 'FRIDAY'], 4);
    expect(dates).toHaveLength(4);
    expect(dates[0].formattedDate).toBe('2026-07-10'); // Friday
    expect(dates[1].formattedDate).toBe('2026-07-13'); // Monday
    expect(dates[2].formattedDate).toBe('2026-07-15'); // Wednesday
    expect(dates[3].formattedDate).toBe('2026-07-17'); // Friday
  });

  it('should regenerate correctly when admin updates startDate and daysOfWeek', () => {
    // Admin changes to 2026-08-01 (Saturday) with Tuesday/Thursday
    const dates = ScheduleGenerator.generateDates('2026-08-01', ['TUESDAY', 'THURSDAY'], 4);
    expect(dates).toHaveLength(4);
    expect(dates[0].formattedDate).toBe('2026-08-04'); // Tuesday
    expect(dates[1].formattedDate).toBe('2026-08-06'); // Thursday
    expect(dates[2].formattedDate).toBe('2026-08-11'); // Tuesday
    expect(dates[3].formattedDate).toBe('2026-08-13'); // Thursday
  });
});
