export const formatDuration = (ms) => {
  if (ms === null || ms <= 0) return null;
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const secondWord = seconds === 1 ? 'second' : 'seconds';
  if (minutes > 0) {
    const minuteWord = minutes === 1 ? 'minute' : 'minutes';
    return seconds > 0 ? `${minutes} ${minuteWord} and ${seconds} ${secondWord}` : `${minutes} ${minuteWord}`;
  }
  return `${seconds} ${secondWord}`;
};
