export interface Exchange {
  id: string;
  name: string;
  nameKr: string;
  country: string;
  timezone: string;
  gmtOffset: number;
  openTime: string; // "09:00" format
  closeTime: string; // "15:30" format
  lunchBreak?: {
    start: string; // "11:30" format
    end: string;   // "13:00" format
  };
  region: 'asia' | 'europe' | 'americas';
  dst?: {
    startMonth: number; // 3 = March
    startWeek: number;  // 2 = 2nd week, -1 = last week
    startDay: number;   // 0 = Sunday
    endMonth: number;   // 11 = November
    endWeek: number;    // 1 = 1st week, -1 = last week  
    endDay: number;     // 0 = Sunday
    offsetDiff: number; // +1 for DST (보통 +1 시간)
  };
  specialInfo: {
    features: string[];
    tradingCurrency: string;
    settlementCycle: string;
    website: string;
  };
}

export interface ExchangeStatus {
  exchange: Exchange;
  localTime: string;
  kstTime: string;
  isOpen: boolean;
  isLunchBreak: boolean;
  nextEvent: 'open' | 'close' | 'lunch_start' | 'lunch_end';
  timeToNextEvent: string;
  isDST?: boolean; // 현재 서머타임인지 여부
  currentGmtOffset?: number; // DST 적용된 현재 GMT 오프셋
}