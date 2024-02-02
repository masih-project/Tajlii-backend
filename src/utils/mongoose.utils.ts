export function dateToJalaliYearMonth(date) {
  let gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    parseInt(((gy2 + 3) / 4) as any) -
    parseInt(((gy2 + 99) / 100) as any) +
    parseInt(((gy2 + 399) / 400) as any) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * parseInt((days / 12053) as any);
  days %= 12053;
  jy += 4 * parseInt((days / 1461) as any);
  days %= 1461;
  jy += parseInt(((days - 1) / 365) as any);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + parseInt((days / 31) as any) : 7 + parseInt(((days - 186) / 30) as any);
  return jy + '-' + jm.toString().padStart(2, '0');
}
