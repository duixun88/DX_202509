import { AlertSettings } from '../types/alert';
import { Exchange } from '../types/exchange';

export function timeToPixels(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours * 60 + minutes) * (1000 / (24 * 60));
}

export function getCurrentTimePixels(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return ((hours * 60 + minutes) * 60 + seconds) * (1000 / (24 * 60 * 60));
}

export function getLocalTimePixels(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return ((hours * 60 + minutes) * 60 + seconds) * (1000 / (24 * 60 * 60));
}

export function getCurrentKSTTime(): Date {
  // 현재 UTC 시간 구하기
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // KST는 UTC+9이므로 9시간(32400000ms) 추가
  const kstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
  
  return kstTime;
}

// DST 적용 여부를 확인하는 함수
export function isDSTActive(exchange: Exchange, currentDate: Date): boolean {
  if (!exchange.dst) {
    return false; // DST 정보가 없으면 DST 적용 안함
  }

  const { startMonth, startWeek, startDay, endMonth, endWeek, endDay } = exchange.dst;
  const year = currentDate.getFullYear();

  // DST 시작일 계산
  const dstStart = getDSTDate(year, startMonth, startWeek, startDay);
  
  // DST 종료일 계산
  const dstEnd = getDSTDate(year, endMonth, endWeek, endDay);

  const currentTime = currentDate.getTime();
  const startTime = dstStart.getTime();
  const endTime = dstEnd.getTime();

  return currentTime >= startTime && currentTime < endTime;
}

// DST 시작/종료일을 계산하는 함수
function getDSTDate(year: number, month: number, week: number, dayOfWeek: number): Date {
  // month는 1-12, week는 1-5 또는 -1(마지막주), dayOfWeek는 0(일요일)-6(토요일)
  
  const firstDay = new Date(year, month - 1, 1);
  
  if (week === -1) {
    // 마지막 주 계산
    const lastDay = new Date(year, month, 0); // 해당 월의 마지막 날
    const lastDayOfWeek = lastDay.getDay();
    const daysBack = (lastDayOfWeek - dayOfWeek + 7) % 7;
    return new Date(year, month - 1, lastDay.getDate() - daysBack, 2, 0, 0); // 오전 2시
  } else {
    // 특정 주 계산
    const firstDayOfWeek = firstDay.getDay();
    const daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7;
    const targetDate = 1 + daysToAdd + (week - 1) * 7;
    return new Date(year, month - 1, targetDate, 2, 0, 0); // 오전 2시
  }
}

// DST를 적용한 현재 GMT 오프셋을 계산하는 함수
export function getCurrentGmtOffset(exchange: Exchange, currentDate: Date): number {
  const baseOffset = exchange.gmtOffset;
  
  if (!exchange.dst) {
    return baseOffset;
  }

  const isDST = isDSTActive(exchange, currentDate);
  return isDST ? baseOffset + exchange.dst.offsetDiff : baseOffset;
}

export function getLocalTime(exchange: any, kstTime: Date): Date {
  const utc = kstTime.getTime() + (kstTime.getTimezoneOffset() * 60000);
  // DST를 고려한 GMT 오프셋 사용
  const currentGmtOffset = getCurrentGmtOffset(exchange, kstTime);
  const exchangeTime = new Date(utc + (currentGmtOffset * 3600000));
  return exchangeTime;
}

export function getExchangeStatus(exchange: any, kstTime: Date) {
  const localTime = getLocalTime(exchange, kstTime);
  
  const [openHour, openMinute] = exchange.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = exchange.closeTime.split(':').map(Number);
  
  const currentHour = localTime.getHours();
  const currentMinute = localTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;
  
  // DST 상태 확인
  const isDST = isDSTActive(exchange, kstTime);
  const currentGmtOffset = getCurrentGmtOffset(exchange, kstTime);
  
  // 점심시간 체크
  let isLunchBreak = false;
  let lunchStartInMinutes = 0;
  let lunchEndInMinutes = 0;
  
  if (exchange.lunchBreak) {
    const [lunchStartHour, lunchStartMinute] = exchange.lunchBreak.start.split(':').map(Number);
    const [lunchEndHour, lunchEndMinute] = exchange.lunchBreak.end.split(':').map(Number);
    lunchStartInMinutes = lunchStartHour * 60 + lunchStartMinute;
    lunchEndInMinutes = lunchEndHour * 60 + lunchEndMinute;
    
    isLunchBreak = currentTimeInMinutes >= lunchStartInMinutes && currentTimeInMinutes < lunchEndInMinutes;
  }
  
  const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes && !isLunchBreak;
  
  let nextEvent: 'open' | 'close' | 'lunch_start' | 'lunch_end';
  let timeToNextEvent: string;
  
  if (isLunchBreak) {
    nextEvent = 'lunch_end';
    const minutesToLunchEnd = lunchEndInMinutes - currentTimeInMinutes;
    if (minutesToLunchEnd > 60) {
      timeToNextEvent = `${Math.floor(minutesToLunchEnd / 60)}시간 ${minutesToLunchEnd % 60}분 후 점심휴장 종료`;
    } else {
      timeToNextEvent = `${minutesToLunchEnd}분 후 점심휴장 종료`;
    }
  } else if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
    // 정규 거래시간 중
    if (exchange.lunchBreak && currentTimeInMinutes < lunchStartInMinutes) {
      // 점심시간 전
      nextEvent = 'lunch_start';
      const minutesToLunch = lunchStartInMinutes - currentTimeInMinutes;
      if (minutesToLunch > 60) {
        timeToNextEvent = `${Math.floor(minutesToLunch / 60)}시간 ${minutesToLunch % 60}분 후 점심휴장 시작`;
      } else {
        timeToNextEvent = `${minutesToLunch}분 후 점심휴장 시작`;
      }
    } else {
      // 점심시간 후 또는 점심시간이 없는 경우
      nextEvent = 'close';
      const minutesToClose = closeTimeInMinutes - currentTimeInMinutes;
      if (minutesToClose > 60) {
        timeToNextEvent = `${Math.floor(minutesToClose / 60)}시간 ${minutesToClose % 60}분 후 폐장`;
      } else {
        timeToNextEvent = `${minutesToClose}분 후 폐장`;
      }
    }
  } else {
    nextEvent = 'open';
    let minutesToOpen;
    if (currentTimeInMinutes < openTimeInMinutes) {
      minutesToOpen = openTimeInMinutes - currentTimeInMinutes;
    } else {
      // 다음날 개장
      minutesToOpen = (24 * 60) - currentTimeInMinutes + openTimeInMinutes;
    }
    
    if (minutesToOpen > 60) {
      const hours = Math.floor(minutesToOpen / 60);
      const minutes = minutesToOpen % 60;
      timeToNextEvent = `${hours}시간 ${minutes}분 후 개장`;
    } else {
      timeToNextEvent = `${minutesToOpen}분 후 개장`;
    }
  }
  
  return {
    exchange,
    localTime: localTime.toLocaleString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    kstTime: kstTime.toLocaleString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    isOpen,
    isLunchBreak,
    nextEvent,
    timeToNextEvent,
    isDST,
    currentGmtOffset
  };
}

// 사용자 정의 알람 시간으로 체크하는 함수
export function getMinutesToEventWithCustomTime(exchange: any, kstTime: Date, alertMinutes: number): { event: 'open' | 'close', minutes: number } | null {
  const localTime = getLocalTime(exchange, kstTime);
  
  const [openHour, openMinute] = exchange.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = exchange.closeTime.split(':').map(Number);
  
  const currentHour = localTime.getHours();
  const currentMinute = localTime.getMinutes();
  const currentSecond = localTime.getSeconds();
  const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;
  const openTimeInSeconds = openHour * 3600 + openMinute * 60;
  const closeTimeInSeconds = closeHour * 3600 + closeMinute * 60;
  
  const alertSeconds = alertMinutes * 60;
  
  // 개장 체크
  const secondsToOpen = openTimeInSeconds - currentTimeInSeconds;
  if (secondsToOpen > 0 && secondsToOpen <= alertSeconds) {
    return { event: 'open', minutes: Math.ceil(secondsToOpen / 60) };
  }
  
  // 폐장 체크 (현재 개장 중이고 설정된 시간 이내 폐장)
  const isCurrentlyOpen = currentTimeInSeconds >= openTimeInSeconds && currentTimeInSeconds < closeTimeInSeconds;
  if (isCurrentlyOpen) {
    const secondsToClose = closeTimeInSeconds - currentTimeInSeconds;
    if (secondsToClose > 0 && secondsToClose <= alertSeconds) {
      return { event: 'close', minutes: Math.ceil(secondsToClose / 60) };
    }
  }
  
  return null;
}

// 기존 3분전 함수 (호환성 유지)
export function getMinutesToEvent(exchange: any, kstTime: Date): { event: 'open' | 'close', minutes: number } | null {
  return getMinutesToEventWithCustomTime(exchange, kstTime, 3);
}

export function getUpcomingAlertsWithSettings(exchanges: any[], alertSettings: AlertSettings[], kstTime: Date) {
  const alerts: Array<{ exchangeId: string, exchangeName: string, event: 'open' | 'close', minutes: number }> = [];
  
  for (const setting of alertSettings) {
    const exchange = exchanges.find(ex => ex.id === setting.exchangeId);
    if (!exchange) continue;
    
    // 개장 알람 체크
    if (setting.openAlertEnabled) {
      const openAlert = getMinutesToEventWithCustomTime(exchange, kstTime, setting.openAlertMinutes);
      if (openAlert && openAlert.event === 'open') {
        alerts.push({
          exchangeId: exchange.id,
          exchangeName: exchange.nameKr,
          event: 'open',
          minutes: openAlert.minutes
        });
      }
    }
    
    // 폐장 알람 체크
    if (setting.closeAlertEnabled) {
      const closeAlert = getMinutesToEventWithCustomTime(exchange, kstTime, setting.closeAlertMinutes);
      if (closeAlert && closeAlert.event === 'close') {
        alerts.push({
          exchangeId: exchange.id,
          exchangeName: exchange.nameKr,
          event: 'close',
          minutes: closeAlert.minutes
        });
      }
    }
  }
  
  return alerts;
}

// DST 기간 정보를 반환하는 함수
export function getDSTInfo(exchange: Exchange, year: number): { start: Date, end: Date } | null {
  if (!exchange.dst) {
    return null;
  }

  const { startMonth, startWeek, startDay, endMonth, endWeek, endDay } = exchange.dst;
  
  const dstStart = getDSTDate(year, startMonth, startWeek, startDay);
  const dstEnd = getDSTDate(year, endMonth, endWeek, endDay);

  return { start: dstStart, end: dstEnd };
}

// 지역별 DST 정보 요약을 반환하는 함수
export function getRegionalDSTInfo(exchanges: Exchange[], currentYear: number) {
  const regions = {
    europe: {
      name: '유럽',
      exchanges: [] as Exchange[],
      dstPeriod: null as { start: Date, end: Date } | null
    },
    americas: {
      name: '미주',
      exchanges: [] as Exchange[],
      dstPeriod: null as { start: Date, end: Date } | null
    }
  };

  exchanges.forEach(exchange => {
    if (exchange.region === 'europe' && exchange.dst) {
      regions.europe.exchanges.push(exchange);
      if (!regions.europe.dstPeriod) {
        regions.europe.dstPeriod = getDSTInfo(exchange, currentYear);
      }
    } else if (exchange.region === 'americas' && exchange.dst) {
      regions.americas.exchanges.push(exchange);
      if (!regions.americas.dstPeriod) {
        regions.americas.dstPeriod = getDSTInfo(exchange, currentYear);
      }
    }
  });

  return regions;
}

// 기존 함수 (호환성 유지)
export function getUpcomingAlerts(exchanges: any[], selectedExchangeIds: string[], kstTime: Date) {
  const alerts: Array<{ exchangeId: string, exchangeName: string, event: 'open' | 'close', minutes: number }> = [];
  
  const selectedExchanges = exchanges.filter(ex => selectedExchangeIds.includes(ex.id));
  
  for (const exchange of selectedExchanges) {
    const alertInfo = getMinutesToEvent(exchange, kstTime);
    if (alertInfo) {
      alerts.push({
        exchangeId: exchange.id,
        exchangeName: exchange.nameKr,
        event: alertInfo.event,
        minutes: alertInfo.minutes
      });
    }
  }
  
  return alerts;
}