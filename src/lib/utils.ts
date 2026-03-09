import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getMinutesUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'on_time': return 'text-green-400';
    case 'delayed': return 'text-amber-400';
    case 'completed': return 'text-blue-400';
    case 'scheduled': return 'text-white/60';
    case 'confirmed': return 'text-green-400';
    case 'cancelled': return 'text-red-400';
    default: return 'text-white/40';
  }
}

export function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'on_time':
      return { label: 'Zamanında', className: 'bg-green-500/10 text-green-400 border-green-500/20' };
    case 'delayed':
      return { label: 'Gecikmeli', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'completed':
      return { label: 'Tamamlandı', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'scheduled':
      return { label: 'Planlandı', className: 'bg-white/5 text-white/60 border-white/10' };
    case 'confirmed':
      return { label: 'Onaylı', className: 'bg-green-500/10 text-green-400 border-green-500/20' };
    case 'cancelled':
      return { label: 'İptal', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
    default:
      return { label: status, className: 'bg-white/5 text-white/40 border-white/10' };
  }
}

export function generateDemoCoordinate(base: { lng: number; lat: number }, variance: number = 0.01) {
  return {
    lng: base.lng + (Math.random() - 0.5) * variance,
    lat: base.lat + (Math.random() - 0.5) * variance,
  };
}
