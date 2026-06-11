import Link from 'next/link';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls =
    size === 'sm'
      ? 'text-xl font-semibold tracking-tight'
      : 'text-2xl font-semibold tracking-tight';
  return (
    <Link href="/" className={cls} aria-label="PlataPay">
      <span className="text-text">Plata</span>
      <span className="text-accent">Pay</span>
    </Link>
  );
}
