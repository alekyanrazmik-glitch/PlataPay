import { Modal } from './Modal';
import { OrderForm } from './OrderForm';
import { InvoiceForm } from './InvoiceForm';
import { HOME_FAQ_LINKS } from '@/data/faq';
import { OfertaText } from './LegalTexts';
import { PolicyText } from './LegalTexts';

export function ModalsRoot() {
  return (
    <>
      <Modal id="popupforma" width="lg">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-text">
            Оформить заявку на оплату
          </h3>
          <p className="mt-1 text-muted text-[14px]">
            Ответим и оплатим в течение 5–15 минут
          </p>
          <OrderForm />
        </div>
      </Modal>

      <Modal id="popupinvoice" width="lg">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-text">
            Оплата зарубежного счёта (инвойса)
          </h3>
          <p className="mt-1 text-muted text-[14px]">
            Оплатим ваш инвойс от иностранной компании — обучение, услуги, товары
          </p>
          <InvoiceForm />
        </div>
      </Modal>

      <Modal id="popupoferta" width="lg">
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold text-text">
            Публичная <span className="text-accent">оферта</span>
          </h2>
          <p className="mt-1 text-muted3 text-[13px]">
            Актуальная редакция · Сайт: payoplata.ru
          </p>
          <OfertaText />
          <div className="text-right pt-4">
            <a href="#" className="btn-ghost">Понятно, закрыть</a>
          </div>
        </div>
      </Modal>

      <Modal id="popuppolicy" width="lg">
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold text-text">
            Политика <span className="text-accent">конфиденциальности</span>
          </h2>
          <p className="mt-1 text-muted3 text-[13px]">
            Актуальная редакция · Сайт: payoplata.ru
          </p>
          <PolicyText />
          <div className="text-right pt-4">
            <a href="#" className="btn-ghost">Понятно, закрыть</a>
          </div>
        </div>
      </Modal>

      {HOME_FAQ_LINKS.map((item, i) => {
        const id = i === 0 ? 'popup:infoblock' : i === 1 ? 'popup2' : 'popup3';
        return (
          <Modal key={id} id={id}>
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-text">{item.q}</h3>
              <p className="mt-3 text-muted leading-relaxed">{item.a}</p>
            </div>
          </Modal>
        );
      })}
    </>
  );
}
