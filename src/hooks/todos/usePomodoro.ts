import { useState, useEffect, useRef } from 'react';
import { PomodoroConfig } from './usePomodoroConfig';

export function usePomodoro(config: PomodoroConfig) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.workDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 当配置改变时，重置计时器
  useEffect(() => {
    reset();
  }, [config.workDuration, config.breakDuration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play completion sound here if enabled
      if (!isBreak) {
        setTimeLeft(config.breakDuration * 60); // 使用配置的休息时间
        setIsBreak(true);
      } else {
        setTimeLeft(config.workDuration * 60); // 使用配置的工作时间
        setIsBreak(false);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isBreak, config.workDuration, config.breakDuration]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? config.breakDuration * 60 : config.workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    isBreak,
    start,
    pause,
    reset,
    formatTime: () => formatTime(timeLeft)
  };
}