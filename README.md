# Проектная работа "Веб-ларек"

## Описание
Интернет-магазин товаров для веб-разработчиков с каталогом, корзиной и пошаговым оформлением заказа. Проект реализован на основе MVP архитектуры с использованием событийной системы для связи компонентов.

## Функциональность
- **Каталог товаров** - отображение товаров с сервера в виде карточек
- **Детальный просмотр товара** - модальное окно с подробной информацией
- **Корзина покупок** - добавление/удаление товаров, расчет общей стоимости  
- **Оформление заказа** - двухэтапный процесс: способ оплаты/доставка → контактные данные
- **Валидация форм** - проверка обязательных полей на каждом шаге
- **Обработка бесценных товаров** - товары с `price: null` недоступны для покупки

## Стек технологий
- **TypeScript** - строгая типизация и современный JS
- **HTML/SCSS** - семантическая разметка и стилизация
- **Webpack** - сборка проекта и dev-server
- **EventEmitter** - система событий для MVP архитектуры

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Товар - `IProduct`:

```ts
interface IProduct {
    id: string; // UUID идентификатор товара
    title: string; // Название товара
    description: string; // Подробное описание товара
    image: string; // Путь к изображению товара
    price: number | null; // Цена в синансах или null для бесценных товаров
    category: string; // Категория товара
}
```

Способ оплаты - `PaymentMethod`:

```ts
type PaymentMethod = 'online' | 'cash' | '';
```

Заказ для отправки на сервер - `IOrderRequest`:

```ts
interface IOrderRequest {
    payment: PaymentMethod; // Способ оплаты  
    address: string; // Адрес доставки (обязательное поле)
    email: string; // Email покупателя (обязательное поле)
    phone: string; // Телефон покупателя (обязательное поле)
    total: number; // Общая сумма заказа (ПРОВЕРЯЕТСЯ СЕРВЕРОМ!)
    items: TypeFrom<IProduct, 'id'>[]; // Массив UUID товаров из корзины
}
```

Ответ сервера при успешном заказе - `IOrderResponse`:

```ts
interface IOrderResponse {
    id: string; // UUID созданного заказа
    total: number; // Сумма заказа для отображения
}
```

Галерея товаров на главной странице - `IProductGalleryModel`:

```ts
interface IProductGalleryModel {
    items: IProduct[]; // Массив товаров
    selection: TypeFrom<IProduct, 'id'> | null; // ID выбранного товара для модального окна

    getProduct(productId: TypeFrom<IProduct, 'id'>): IProduct | null;
}
```

Данные товара для отображения в карточке - `IProductViewData`:
```ts
interface IProductViewData extends IProduct {
    inCart: boolean; // Находится ли товар в корзине (приходит из модели корзины ICartModel.hasProduct)
}
```

## Архитектура приложения

Код приложения спроектирован согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   

### Слой данных

#### Класс ProductGalleryModel
Класс отвечает за управление каталогом товаров и отслеживание выбранного для просмотра товара.
Конструктор класса принимает экземпляр брокера событий (IEvents) для обеспечения связи с другими компонентами приложения через паттерн Observer.

В полях класса хранятся следующие данные:
- `_items: IProduct[]` - массив товаров каталога, загруженных с сервера
- `_selection: TypeFrom<IProduct, 'id'> | null` - UUID выбранного товара для отображения в модальном окне детального просмотра
- `events: IEvents` - брокер событий для уведомления других компонентов об изменениях

**Основные методы:**
- `getProduct(productId: TypeFrom<IProduct, 'id'>): IProduct | null` - возвращает товар по его UUID или null, если товар не найден
- `get items(): IProduct[]` - геттер для получения массива товаров
- `set items(value: IProduct[])` - сеттер для обновления каталога, генерирует событие `gallery:items_updated`
- `get selection(): TypeFrom<IProduct, 'id'> | null` - геттер для получения ID выбранного товара
- `set selection(value: TypeFrom<IProduct, 'id'>) | null` - сеттер для выбора товара, генерирует событие `gallery:selection_changed`

### Слой представления (View)

Слой представления отвечает за отображение данных и взаимодействие с пользователем.

#### Интерфейс IComponent<T>
Основной интерфейс, который реализуют все компоненты представления.

**Методы:**
- `render(data?: Partial<T>): HTMLElement` - обновляет компонент данными и возвращает DOM элемент

#### Интерфейс IComponentFactory<T>
Интерфейс фабрики создания компонентов использующийся при отображении коллекций данных.

**Методы:**
- `build(): IComponent<T>` - создает новый экземпляр компонента - элемента коллекции

#### Базовый класс Component<T>
Абстрактный класс, от которого наследуются все компоненты представления. Реализует интерфейс `IComponent<T>`.

**Утилитарные методы:**
- `setText(element: HTMLElement, value: string): void` - установка текстового содержимого
- `toggleClass(element: HTMLElement, className: string, state?: boolean): void` - переключение CSS классов
- `setDisabled(element: HTMLElement, state: boolean): void` - установка состояния disabled
- `setImage(element: HTMLImageElement, src: string, alt?: string): void` - установка изображения

#### Класс ProductView
Компонент для отображения карточки товара.

**Наследуется от:** `Component<IProductViewData>`

**Принимаемые данные:** Объект типа `IProductViewData` (расширенный `IProduct` с полем `inCart: boolean`)

**Основные сеттеры (protected):**
- `set id(value: string)` - устанавливает ID товара для использования в событиях
- `set title(value: string)` - устанавливает название товара
- `set description(value: string)` - устанавливает описание товара
- `set image(value: string)` - устанавливает изображение товара
- `set price(value: number | null)` - устанавливает цену (или "Бесценно")
- `set category(value: string)` - устанавливает категорию с соответствующим цветом
- `set inCart(value: Pick<IProductViewData, 'inCart' | 'price'>)` - управляет состоянием кнопки (В корзину/Удалить/Недоступно)

**Основные методы:**
- `render(data?: Partial<IProductViewData>): HTMLElement` - обновляет компонент данными товара и возвращает DOM элемент

**Генерируемые события:**
- `product:action_called` - при клике на кнопку действия (Купить/Убрать) а также при нажатии кнопки удаления в корзине

#### Класс ProductGalleryView
Компонент для отображения галереи товаров на главной странице.

**Наследуется от:** `Component<IProduct[]>`

**Основные методы:**
- `render(data?: Partial<IProduct[]>): HTMLElement` - отрисовывает список товаров в галерее

### Слой коммуникации (API)

#### Класс Api
Базовый класс для работы с HTTP запросами. Инкапсулирует логику отправки запросов к серверу.

**Реализует интерфейс:** `IApi`

**Основные методы:**
- `get<T>(uri: string): Promise<T>` - выполняет GET запрос
- `post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` - выполняет POST/PUT/DELETE запрос
- `handleResponse<T>(response: Response): Promise<T>` - обрабатывает ответ сервера

#### Класс LarekApi
Специализированный API клиент для веб-ларька. Использует композицию с базовым `Api`.

**Основные методы:**
- `getProducts(): Promise<IProduct[]>` - получает каталог товаров с сервера, автоматически добавляет CDN_URL к изображениям
- `sendOrder(orderData: IOrderRequest): Promise<IOrderResponse>` - отправляет заказ на сервер

**API Endpoints:**
- `GET /product` → `{total: number, items: IProduct[]}` - получение каталога
- `POST /order` → `{id: string, total: number}` - создание заказа

### Фабрики компонентов

#### Класс ProductViewFactory
Фабрика для создания компонентов ProductView.

**Реализует интерфейс:** `IComponentFactory<IProductViewData>`

**Конструктор принимает:**
- `templateSelector: string | HTMLTemplateElement` - селектор или элемент HTML шаблона (например, `#card-catalog`, `#card-preview`)
- `events?: IEvents` - брокер событий (опционально)
- `config?: Partial<ProductViewConfig>` - конфигурация компонента (опционально)

**Основные методы:**
- `build(): IComponent<IProductViewData>` - создает новый экземпляр ProductView на основе указанного шаблона

### Презентер

Логика связывания слоев реализована в файле `src/index.ts` через систему событий.

**Основные обработчики событий:**
- `product:select` - открытие модального окна с деталями товара
- `product:action_called` - добавление/удаление товара в корзину
- `gallery:items_updated` - перерисовка галереи при загрузке данных
- `gallery:selection_changed` - отображение выбранного товара в модальном окне
