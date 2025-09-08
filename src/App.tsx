import React, { useState, useEffect, useRef } from 'react';
import { exchanges } from './data/exchanges';
import { ExchangeStatus } from './types/exchange';
import { AlertSettings as AlertSettingsType, AlertPopup as AlertPopupType } from './types/alert';
import { getCurrentKSTTime, getExchangeStatus, getUpcomingAlertsWithSettings } from './utils/timeUtils';
import { alertSoundManager } from './utils/alertSounds';
import { ExchangeCard } from './components/ExchangeCard';
import { TimeIndicator } from './components/TimeIndicator';
import { TimelineView } from './components/TimelineView';
import { ExchangeSelector } from './components/ExchangeSelector';
import { AlertBanner } from './components/AlertBanner';
import { AlertSettings } from './components/AlertSettings';
import { AlertPopup } from './components/AlertPopup';
import { Button } from './components/ui/button';
import { Settings, X, Moon, Sun, Bell, BarChart3, Grid3X3 } from 'lucide-react';

export default function App() {
  const [currentTime, setCurrentTime] = useState<Date>(getCurrentKSTTime());
  const [exchangeStatuses, setExchangeStatuses] = useState<ExchangeStatus[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('timeline');
  const [alerts, setAlerts] = useState<Array<{ exchangeId: string, exchangeName: string, event: 'open' | 'close', minutes: number }>>([]);
  
  // 새로운 알람 관련 상태
  const [alertSettings, setAlertSettings] = useState<AlertSettingsType[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertPopups, setAlertPopups] = useState<AlertPopupType[]>([]);
  const previousAlertsRef = useRef<string[]>([]);

  // localStorage에서 다크 모드 설정 로드
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // localStorage에서 거래소 선택 설정 로드
  useEffect(() => {
    const savedSelection = localStorage.getItem('selectedExchanges');
    if (savedSelection) {
      setSelectedExchanges(JSON.parse(savedSelection));
    } else {
      // 기본값: 모든 거래소 선택
      setSelectedExchanges(exchanges.map(ex => ex.id));
    }
  }, []);

  // localStorage에서 알람 설정 로드
  useEffect(() => {
    const savedAlertSettings = localStorage.getItem('alertSettings');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedViewMode = localStorage.getItem('viewMode');
    
    if (savedAlertSettings) {
      setAlertSettings(JSON.parse(savedAlertSettings));
    }
    
    if (savedSoundEnabled !== null) {
      const enabled = JSON.parse(savedSoundEnabled);
      setSoundEnabled(enabled);
      alertSoundManager.setEnabled(enabled);
    }
    
    if (savedViewMode) {
      setViewMode(JSON.parse(savedViewMode));
    }
  }, []);

  // 선택 상태를 localStorage에 저장
  useEffect(() => {
    if (selectedExchanges.length > 0) {
      localStorage.setItem('selectedExchanges', JSON.stringify(selectedExchanges));
    }
  }, [selectedExchanges]);

  // 다크 모드 상태를 localStorage에 저장 및 DOM 클래스 토글
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // 알람 설정을 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
  }, [alertSettings]);

  // 사운드 설정을 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    alertSoundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // 보기 모드를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('viewMode', JSON.stringify(viewMode));
  }, [viewMode]);

  useEffect(() => {
    const updateTime = () => {
      const now = getCurrentKSTTime();
      setCurrentTime(now);
      
      const statuses = exchanges.map(exchange => getExchangeStatus(exchange, now));
      setExchangeStatuses(statuses);
      
      // 새로운 알람 시스템 사용
      const upcomingAlerts = getUpcomingAlertsWithSettings(exchanges, alertSettings, now);
      setAlerts(upcomingAlerts);
      
      // 새로운 알람 감지 및 팝업 생성
      const currentAlertKeys = upcomingAlerts.map(alert => 
        `${alert.exchangeId}-${alert.event}-${alert.minutes}`
      );
      
      const newAlerts = currentAlertKeys.filter(key => 
        !previousAlertsRef.current.includes(key)
      );
      
      if (newAlerts.length > 0) {
        const newPopups = upcomingAlerts
          .filter(alert => newAlerts.includes(`${alert.exchangeId}-${alert.event}-${alert.minutes}`))
          .map(alert => ({
            id: `${alert.exchangeId}-${alert.event}-${Date.now()}`,
            exchangeName: alert.exchangeName,
            event: alert.event,
            minutes: alert.minutes,
            timestamp: Date.now()
          }));
        
        setAlertPopups(prev => [...prev, ...newPopups]);
        
        // 사운드 재생
        if (soundEnabled) {
          newPopups.forEach(popup => {
            if (popup.event === 'open') {
              alertSoundManager.playOpenAlert();
            } else {
              alertSoundManager.playCloseAlert();
            }
          });
        }
      }
      
      previousAlertsRef.current = currentAlertKeys;
    };

    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [alertSettings, soundEnabled]);

  // 선택된 거래소만 필터링
  const filteredStatuses = exchangeStatuses.filter(status => 
    selectedExchanges.includes(status.exchange.id)
  );

  // 지역별로 필터링하고 GMT 오프셋 내림차순으로 정렬
  const asiaExchanges = filteredStatuses
    .filter(status => status.exchange.region === 'asia')
    .sort((a, b) => b.exchange.gmtOffset - a.exchange.gmtOffset);
  
  const europeExchanges = filteredStatuses
    .filter(status => status.exchange.region === 'europe')
    .sort((a, b) => b.exchange.gmtOffset - a.exchange.gmtOffset);
  
  const americasExchanges = filteredStatuses
    .filter(status => status.exchange.region === 'americas')
    .sort((a, b) => b.exchange.gmtOffset - a.exchange.gmtOffset);

  const openCount = filteredStatuses.filter(status => status.isOpen).length;
  const lunchBreakCount = filteredStatuses.filter(status => status.isLunchBreak).length;
  const totalSelectedCount = filteredStatuses.length;
  const totalCount = exchanges.length;
  const alertCount = alertSettings.filter(s => s.openAlertEnabled || s.closeAlertEnabled).length;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const dismissAlertPopup = (alertId: string) => {
    setAlertPopups(prev => prev.filter(popup => popup.id !== alertId));
  };

  const dismissAllAlertPopups = () => {
    setAlertPopups([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 알람 배너 */}
      <AlertBanner alerts={alerts} />

      {/* 설정 패널 */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        showSettings ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">설정</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ExchangeSelector
            exchanges={exchanges}
            selectedExchanges={selectedExchanges}
            onSelectionChange={setSelectedExchanges}
          />
        </div>
      </div>

      {/* 알람 설정 패널 */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        showAlertSettings ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">알람 설정</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlertSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertSettings
            exchanges={exchanges}
            alertSettings={alertSettings}
            onSettingsChange={setAlertSettings}
            soundEnabled={soundEnabled}
            onSoundEnabledChange={setSoundEnabled}
          />
        </div>
      </div>

      {/* 왼쪽 버튼 그룹 (설정, 알람, 보기모드) */}
      <div className={`fixed left-4 ${alerts.length > 0 ? 'top-20' : 'top-4'} z-40 flex gap-2 transition-all duration-300 ${
        (showSettings || showAlertSettings) ? 'translate-x-80' : 'translate-x-0'
      }`}>
        {/* 설정 버튼 */}
        <Button
          variant="outline"
          size="sm"
          className={`${showSettings ? 'bg-accent' : ''}`}
          onClick={() => {
            setShowSettings(!showSettings);
            setShowAlertSettings(false);
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">설정</span>
        </Button>

        {/* 알람 설정 버튼 */}
        <Button
          variant="outline"
          size="sm"
          className={`${showAlertSettings ? 'bg-accent' : ''} ${
            alertCount > 0 ? 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400' : ''
          }`}
          onClick={() => {
            setShowAlertSettings(!showAlertSettings);
            setShowSettings(false);
          }}
        >
          <Bell className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">알람</span>
          {alertCount > 0 && (
            <span className="ml-1 text-xs bg-orange-100 dark:bg-orange-900 px-1.5 py-0.5 rounded-full">
              {alertCount}
            </span>
          )}
        </Button>

        {/* 보기 모드 토글 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'cards' ? 'timeline' : 'cards')}
        >
          {viewMode === 'timeline' ? (
            <Grid3X3 className="h-4 w-4 mr-2" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          <span className="hidden sm:inline">
            {viewMode === 'timeline' ? '카드 보기' : '타임라인'}
          </span>
        </Button>
      </div>

      {/* 다크 모드 토글 버튼 */}
      <Button
        variant="outline"
        size="sm"
        className={`fixed right-4 ${alerts.length > 0 ? 'top-20' : 'top-4'} z-40 transition-all duration-300`}
        onClick={toggleDarkMode}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 mr-2" />
        ) : (
          <Moon className="h-4 w-4 mr-2" />
        )}
        <span className="hidden sm:inline">
          {isDarkMode ? '라이트 모드' : '다크 모드'}
        </span>
      </Button>

      {/* 알람 팝업 */}
      <AlertPopup
        alerts={alertPopups}
        onDismiss={dismissAlertPopup}
        onDismissAll={dismissAllAlertPopups}
      />

      {/* 메인 컨텐츠 */}
      <div className={`transition-all duration-300 ${showSettings || showAlertSettings ? 'ml-80' : 'ml-0'}`}>
        <div className={`p-6 ${alerts.length > 0 ? 'pt-16' : 'pt-16'}`}>
          <div className="max-w-7xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">글로벌 증권거래소 모니터링 시스템</h1>
              <p className="text-muted-foreground mb-4">
                전 세계 주요 증권거래소의 실시간 운영상태 - 한국시간(KST) 기준 
                {viewMode === 'timeline' && '• 타임라인 보기'}
                {viewMode === 'cards' && '• 카드 보기'}
              </p>
              <div className="text-xl font-mono text-primary">
                현재 시간: {currentTime.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })} (KST)
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                현재 {openCount}개 거래소가 개장 중
                {lunchBreakCount > 0 && <span className="text-orange-600 dark:text-orange-400">, {lunchBreakCount}개가 점심휴장 중</span>}
                <span> (선택된 {totalSelectedCount}개 중 / 전체 {totalCount}개)</span>
              </div>
              {alerts.length > 0 && (
                <div className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-medium">
                  ⚠️ {alerts.length}개의 알람이 활성화되어 있습니다
                </div>
              )}
              {alertCount > 0 && (
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  🔔 {alertCount}개 거래소의 알람이 설정되어 있습니다
                </div>
              )}
            </div>

            {/* 선택된 거래소가 없을 때 */}
            {totalSelectedCount === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">선택된 거래소가 없습니다.</p>
                <Button onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  거래소 선택하기
                </Button>
              </div>
            )}

            {/* 타임라인 보기 */}
            {totalSelectedCount > 0 && viewMode === 'timeline' && (
              <div className="mb-8">
                <TimelineView 
                  exchangeStatuses={filteredStatuses}
                  currentTime={currentTime}
                />
              </div>
            )}

            {/* 카드 보기 */}
            {totalSelectedCount > 0 && viewMode === 'cards' && (
              <>
                {/* 실시간 시간 표시기 */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">24시간 타임라인</h2>
                  <TimeIndicator currentTime={currentTime} />
                </div>

                {/* 거래소 카드들 */}
                <div className="space-y-8">
                  {asiaExchanges.length > 0 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4 text-blue-700 dark:text-blue-400">
                        아시아 증시 ({asiaExchanges.length}개)
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {asiaExchanges.map(status => (
                          <ExchangeCard key={status.exchange.id} status={status} />
                        ))}
                      </div>
                    </div>
                  )}

                  {europeExchanges.length > 0 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4 text-green-700 dark:text-green-400">
                        유럽 증시 ({europeExchanges.length}개)
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {europeExchanges.map(status => (
                          <ExchangeCard key={status.exchange.id} status={status} />
                        ))}
                      </div>
                    </div>
                  )}

                  {americasExchanges.length > 0 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4 text-orange-700 dark:text-orange-400">
                        미주 증시 ({americasExchanges.length}개)
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {americasExchanges.map(status => (
                          <ExchangeCard key={status.exchange.id} status={status} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 푸터 */}
            {totalSelectedCount > 0 && (
              <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>실시간 업데이트: 500ms 간격 | 시간대: 한국표준시(KST, GMT+9)</p>
                <p className="mt-1">* 공휴일 및 특별 거래일정은 반영되지 않습니다.</p>
                <p className="mt-1">* 개장/폐장 알람은 사용자 설정에 따라 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}