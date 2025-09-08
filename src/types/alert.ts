export interface AlertSettings {
  exchangeId: string;
  openAlertEnabled: boolean;
  closeAlertEnabled: boolean;
  openAlertMinutes: number;
  closeAlertMinutes: number;
}

export interface AlertPopup {
  id: string;
  exchangeName: string;
  event: 'open' | 'close';
  minutes: number;
  timestamp: number;
}