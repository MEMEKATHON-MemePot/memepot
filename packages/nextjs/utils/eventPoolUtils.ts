function get1DNextDraw(): Date {
  const now = new Date();
  const onlyDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(onlyDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function get1WNextDraw(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = (8 - day) % 7 || 7;
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextMonday = new Date(baseDate);
  nextMonday.setDate(baseDate.getDate() + daysUntilNextMonday);
  return nextMonday;
}

function get1MNextDraw(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const nextMonthFirst = new Date(year, month + 1, 1, 0, 0, 0);
  return nextMonthFirst;
}

export function getNextDraw(frequency: "1D" | "1W" | "1M"): Date {
  switch (frequency) {
    case "1D":
      return get1DNextDraw();
    case "1W":
      return get1WNextDraw();
    case "1M":
      return get1MNextDraw();
    default:
      return get1DNextDraw();
  }
}
