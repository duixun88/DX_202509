import { Exchange } from '../types/exchange';

export const exchanges: Exchange[] = [
  // 아시아 7개
  {
    id: 'krx',
    name: 'Korea Exchange',
    nameKr: '한국거래소',
    country: '대한민국',
    timezone: 'Asia/Seoul',
    gmtOffset: 9,
    openTime: '09:00',
    closeTime: '15:30',
    region: 'asia',
    specialInfo: {
      features: ['동시호가제도', 'VI(변동성완화장치)', '서킷브레이커','테스트'],
      tradingCurrency: 'KRW (원)',
      settlementCycle: 'T+2',
      website: 'https://www.krx.co.kr'
    }
  },
  {
    id: 'tse',
    name: 'Tokyo Stock Exchange',
    nameKr: '도쿄증권거래소',
    country: '일본',
    timezone: 'Asia/Tokyo',
    gmtOffset: 9,
    openTime: '09:00',
    closeTime: '15:00',
    lunchBreak: {
      start: '11:30',
      end: '12:30'
    },
    region: 'asia',
    specialInfo: {
      features: ['아로하스시스템', '점심시간 휴장', 'ToSTNeT거래'],
      tradingCurrency: 'JPY (엔)',
      settlementCycle: 'T+2',
      website: 'https://www.jpx.co.jp'
    }
  },
  {
    id: 'sse',
    name: 'Shanghai Stock Exchange',
    nameKr: '상하이증권거래소',
    country: '중국',
    timezone: 'Asia/Shanghai',
    gmtOffset: 8,
    openTime: '09:30',
    closeTime: '15:00',
    lunchBreak: {
      start: '11:30',
      end: '13:00'
    },
    region: 'asia',
    specialInfo: {
      features: ['가격제한폭 ±10%', '점심시간 휴장', 'A주/B주 구분'],
      tradingCurrency: 'CNY (위안)',
      settlementCycle: 'T+1',
      website: 'https://www.sse.com.cn'
    }
  },
  {
    id: 'hkex',
    name: 'Hong Kong Stock Exchange',
    nameKr: '홍콩증권거래소',
    country: '홍콩',
    timezone: 'Asia/Hong_Kong',
    gmtOffset: 8,
    openTime: '09:30',
    closeTime: '16:00',
    lunchBreak: {
      start: '12:00',
      end: '13:00'
    },
    region: 'asia',
    specialInfo: {
      features: ['중국기업 상장', '점심시간 휴장', '듀얼카운터'],
      tradingCurrency: 'HKD (홍콩달러)',
      settlementCycle: 'T+2',
      website: 'https://www.hkex.com.hk'
    }
  },
  {
    id: 'sgx',
    name: 'Singapore Exchange',
    nameKr: '싱가포르거래소',
    country: '싱가포르',
    timezone: 'Asia/Singapore',
    gmtOffset: 8,
    openTime: '09:00',
    closeTime: '17:00',
    region: 'asia',
    specialInfo: {
      features: ['다통화 거래', '휴장 없음', 'REIT 중심'],
      tradingCurrency: 'SGD (싱가포르달러)',
      settlementCycle: 'T+2',
      website: 'https://www.sgx.com'
    }
  },
  {
    id: 'bse',
    name: 'Bombay Stock Exchange',
    nameKr: '봄베이증권거래소',
    country: '인도',
    timezone: 'Asia/Kolkata',
    gmtOffset: 5.5,
    openTime: '09:15',
    closeTime: '15:30',
    region: 'asia',
    specialInfo: {
      features: ['회로차단기', '전자거래시스템', '롤링결제'],
      tradingCurrency: 'INR (루피)',
      settlementCycle: 'T+2',
      website: 'https://www.bseindia.com'
    }
  },
  {
    id: 'asx',
    name: 'Australian Securities Exchange',
    nameKr: '호주증권거래소',
    country: '호주',
    timezone: 'Australia/Sydney',
    gmtOffset: 11,
    openTime: '10:00',
    closeTime: '16:00',
    region: 'asia',
    specialInfo: {
      features: ['연속경매', '휴장 없음', '자원주 중심'],
      tradingCurrency: 'AUD (호주달러)',
      settlementCycle: 'T+2',
      website: 'https://www.asx.com.au'
    }
  },
  
  // 유럽 5개
  {
    id: 'lse',
    name: 'London Stock Exchange',
    nameKr: '런던증권거래소',
    country: '영국',
    timezone: 'Europe/London',
    gmtOffset: 0,
    openTime: '08:00',
    closeTime: '16:30',
    region: 'europe',
    dst: {
      startMonth: 3,   // 3월
      startWeek: -1,   // 마지막 주
      startDay: 0,     // 일요일
      endMonth: 10,    // 10월
      endWeek: -1,     // 마지막 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['연속거래', '다국적 기업 상장', 'AIM 시장'],
      tradingCurrency: 'GBP (파운드)',
      settlementCycle: 'T+2',
      website: 'https://www.londonstockexchange.com'
    }
  },
  {
    id: 'euronext',
    name: 'Euronext Paris',
    nameKr: '유로넥스트 파리',
    country: '프랑스',
    timezone: 'Europe/Paris',
    gmtOffset: 1,
    openTime: '09:00',
    closeTime: '17:30',
    region: 'europe',
    dst: {
      startMonth: 3,   // 3월
      startWeek: -1,   // 마지막 주
      startDay: 0,     // 일요일
      endMonth: 10,    // 10월
      endWeek: -1,     // 마지막 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['연속거래', '유로넥스트 통합', '알고리즘 거래'],
      tradingCurrency: 'EUR (유로)',
      settlementCycle: 'T+2',
      website: 'https://www.euronext.com'
    }
  },
  {
    id: 'xetra',
    name: 'XETRA (Frankfurt)',
    nameKr: '프랑크푸르트거래소',
    country: '독일',
    timezone: 'Europe/Berlin',
    gmtOffset: 1,
    openTime: '09:00',
    closeTime: '17:30',
    region: 'europe',
    dst: {
      startMonth: 3,   // 3월
      startWeek: -1,   // 마지막 주
      startDay: 0,     // 일요일
      endMonth: 10,    // 10월
      endWeek: -1,     // 마지막 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['XETRA 시스템', '연속거래', '고빈도거래'],
      tradingCurrency: 'EUR (유로)',
      settlementCycle: 'T+2',
      website: 'https://www.xetra.com'
    }
  },
  {
    id: 'six',
    name: 'SIX Swiss Exchange',
    nameKr: '스위스거래소',
    country: '스위스',
    timezone: 'Europe/Zurich',
    gmtOffset: 1,
    openTime: '09:00',
    closeTime: '17:30',
    region: 'europe',
    dst: {
      startMonth: 3,   // 3월
      startWeek: -1,   // 마지막 주
      startDay: 0,     // 일요일
      endMonth: 10,    // 10월
      endWeek: -1,     // 마지막 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['다통화 거래', '연속거래', '구조화상품'],
      tradingCurrency: 'CHF (스위스프랑)',
      settlementCycle: 'T+2',
      website: 'https://www.six-group.com'
    }
  },
  {
    id: 'borsa',
    name: 'Borsa Italiana',
    nameKr: '이탈리아거래소',
    country: '이탈리아',
    timezone: 'Europe/Rome',
    gmtOffset: 1,
    openTime: '09:00',
    closeTime: '17:30',
    region: 'europe',
    dst: {
      startMonth: 3,   // 3월
      startWeek: -1,   // 마지막 주
      startDay: 0,     // 일요일
      endMonth: 10,    // 10월
      endWeek: -1,     // 마지막 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['MTA 시스템', '연속거래', 'STAR 세그먼트'],
      tradingCurrency: 'EUR (유로)',
      settlementCycle: 'T+2',
      website: 'https://www.borsaitaliana.it'
    }
  },
  
  // 미주 3개
  {
    id: 'nyse',
    name: 'New York Stock Exchange',
    nameKr: '뉴욕증권거래소',
    country: '미국',
    timezone: 'America/New_York',
    gmtOffset: -5,
    openTime: '09:30',
    closeTime: '16:00',
    region: 'americas',
    dst: {
      startMonth: 3,   // 3월
      startWeek: 2,    // 둘째 주
      startDay: 0,     // 일요일
      endMonth: 11,    // 11월
      endWeek: 1,      // 첫째 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['전자+현장 하이브리드', '회로차단기', 'DMM 시스템'],
      tradingCurrency: 'USD (달러)',
      settlementCycle: 'T+1',
      website: 'https://www.nyse.com'
    }
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    nameKr: '나스닥',
    country: '미국',
    timezone: 'America/New_York',
    gmtOffset: -5,
    openTime: '09:30',
    closeTime: '16:00',
    region: 'americas',
    dst: {
      startMonth: 3,   // 3월
      startWeek: 2,    // 둘째 주
      startDay: 0,     // 일요일
      endMonth: 11,    // 11월
      endWeek: 1,      // 첫째 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['완전전자거래', '마켓메이커제도', '기술주 중심'],
      tradingCurrency: 'USD (달러)',
      settlementCycle: 'T+1',
      website: 'https://www.nasdaq.com'
    }
  },
  {
    id: 'tsx',
    name: 'Toronto Stock Exchange',
    nameKr: '토론토증권거래소',
    country: '캐나다',
    timezone: 'America/Toronto',
    gmtOffset: -5,
    openTime: '09:30',
    closeTime: '16:00',
    region: 'americas',
    dst: {
      startMonth: 3,   // 3월
      startWeek: 2,    // 둘째 주
      startDay: 0,     // 일요일
      endMonth: 11,    // 11월
      endWeek: 1,      // 첫째 주
      endDay: 0,       // 일요일
      offsetDiff: 1    // +1시간
    },
    specialInfo: {
      features: ['연속거래', '듀얼리스팅', '자원주 중심'],
      tradingCurrency: 'CAD (캐나다달러)',
      settlementCycle: 'T+2',
      website: 'https://www.tsx.com'
    }
  }
];