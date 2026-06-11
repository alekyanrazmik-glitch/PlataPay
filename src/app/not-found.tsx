import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-pp py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-section mt-3">Страница не найдена</h1>
      <p className="sub mt-3 max-w-md mx-auto">
        Возможно, страница была перемещена или ссылка устарела. Откройте каталог
        или вернитесь на главную.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn-primary">На главную</Link>
        <Link href="/catalog" className="btn-ghost">Открыть каталог</Link>
      </div>
    </section>
  );
}
