export const formatCurrency = (amount: number): string => {
  const num = Math.abs(Math.round(amount));
  const str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${str}`;
};

export const formatCurrencyFull = (amount: number): string => {
  const prefix = amount < 0 ? '-' : '';
  const num = Math.abs(Math.round(amount));
  const str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${prefix}Rp ${str}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getDayLabel = (date: Date): string => {
  const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  return days[date.getDay()];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};
