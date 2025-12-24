export function timeLeft(isoDateString) {
  const target = new Date(isoDateString);
  const now = new Date();

  let diffMs = target - now;
  if (diffMs <= 0) return "0d : 0h : 0m";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d : ${hours}h : ${minutes}m`;
}
