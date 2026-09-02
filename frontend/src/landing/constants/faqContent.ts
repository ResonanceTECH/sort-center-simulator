export const FAQ = {
  id: 'faq',
  title: 'Частые вопросы',
  items: [
    {
      id: 'tms-diff',
      question: 'Чем SupplyTwin отличается от TMS?',
      answer:
        'TMS фокусируется на маршрутизации, dispatching и tracking. SupplyTwin объединяет стратегию, планирование и исполнение: predictive ETA, impact analysis, exception management и what-if сценарии до внедрения изменений.',
    },
    {
      id: 'integrations',
      question: 'Нужна ли интеграция с ERP, TMS и WMS?',
      answer:
        'Да. Платформа агрегирует данные из разных систем — ERP, TMS, WMS, Excel и каналов перевозчиков — в единую модель цепочки поставок с актуальной картиной сети.',
    },
    {
      id: 'control-tower',
      question: 'Что такое Control Tower?',
      answer:
        'Операционный центр цепочки: live map, активные поставки, predictive ETA, очередь исключений, incidents и рекомендуемые действия — без ручного поиска проблем среди сотен shipments.',
    },
    {
      id: 'scenarios',
      question: 'Как работают what-if сценарии?',
      answer:
        'Вы меняете параметры — demand, capacity поставщика, маршрут, carrier — система пересчитывает KPI, сравнивает base vs scenario и формирует рекомендацию по OTIF, cost и stockout risk.',
    },
    {
      id: 'users',
      question: 'Кто основные пользователи платформы?',
      answer:
        'Supply chain managers, logistics managers, supply planners, procurement и inventory planners, dispatchers и руководители — каждый видит свой слой в едином контуре управления.',
    },
    {
      id: 'browser',
      question: 'Можно ли работать из браузера?',
      answer:
        'Да. SupplyTwin — B2B веб-приложение: Control Tower, планирование, shipments, exceptions и сценарии доступны без установки desktop-клиента.',
    },
  ],
} as const;
