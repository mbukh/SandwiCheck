export const capitalizeFirst = (string: string): string => string.charAt(0).toUpperCase() + string.slice(1);

export interface TimeDifference {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const timeDifference = (date1: number, date2: number): TimeDifference => {
  const difference = date2 - date1;
  return {
    days: Math.floor(difference / 1000 / 60 / 60 / 24),
    hours: Math.floor(difference / 1000 / 60 / 60),
    minutes: Math.floor(difference / 1000 / 60),
    seconds: Math.floor(difference / 1000),
  };
};
