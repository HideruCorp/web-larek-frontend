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
type PaymentMethod = 'card' | 'cash' | '';
```

Заказ для отправки на сервер - `IOrderRequest`:

```ts
interface IOrderRequest {
    payment: PaymentMethod; // Способ оплаты
    address: string; // Адрес доставки (обязательное поле)
    email: string; // Email покупателя (обязательное поле)
    phone: string; // Телефон покупателя (обязательное поле)
    total: number; // Общая сумма заказа (проверяется сервером!)
    items: TypeFrom<IProduct, 'id'>[]; // Массив UUID товаров из корзины
}
```

Типы ответа сервера при заказе:

Успешный ответ - `TOrderSuccess`:
```ts
type TOrderSuccess = {
    id: string; // Id заказа
    total: number; // Общая сумма заказа
};
```

Ошибка заказа - `TOrderError`:
```ts
type TOrderError = {
    error: string; // Сообщение об ошибке
};
```

Общий тип ответа - `IOrderResponse`:
```ts
type IOrderResponse = TOrderSuccess | TOrderError;
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

Данные товара для корзины - `TCartItem`:
```ts
type TCartItem = Pick<IProduct, 'id' | 'price'>;
```

Корзина - `ICartModel`:

```ts
interface ICartModel {
    items: TypeFrom<IProduct, 'id'>[]; // Массив ID товаров в корзине
    totalCost: number; // Общая стоимость (вычисляемое поле)
    count: number; // Количество товаров (вычисляемое поле) 
    isEmpty: boolean; // Пустая ли корзина (вычисляемое поле)

    addProduct(productData: TCartItem): void; // Добавляет товар с данными о цене
    removeProduct(productId: TypeFrom<IProduct, 'id'>): void;
    hasProduct(productId: TypeFrom<IProduct, 'id'>): boolean;
    clear(): void; // Очистка после успешного заказа
}
```

Данные элемента корзины для отображения - `ICartItemData`:
```ts
interface ICartItemData extends Pick<IProduct, 'id' | 'title' | 'price'> {
    cartIndex: number; // Позиция товара в корзине (1, 2, 3...)
}
```

Данные корзины для отображения - `ICartViewData`:
```ts
interface ICartViewData {
    items: ICartItemData[]; // Массив товаров корзины с индексами
    totalCost: number; // Общая стоимость корзины
    isEmpty: boolean; // Пустая ли корзина
}
```

Информация о корзине для иконки - `TCartInfo`:
```ts
type TCartInfo = Pick<ICartModel, 'count'>;
```

Товары для оформления заказа - `TOrderItems`:
```ts
type TOrderItems = Pick<IOrderRequest, 'items' | 'total'>;
```

Данные по оплате и доставке товара при оформлении заказа - `TOrderDelivery`:

```ts
type TOrderDelivery = Pick<IOrderRequest, 'payment' | 'address'>;
```

Контактные данные получателя при оформлении заказа - `TOrderContacts`:

```ts
type TOrderContacts = Pick<IOrderRequest, 'email' | 'phone'>;
```

Шаги оформления заказа - `OrderStep`:

```ts
enum OrderStep {
    Cart = 'cart',           // Корзина, процесс оформления не начат
    Delivery = 'delivery',   // Выбор способа оплаты и адреса доставки
    Contacts = 'contacts',   // Ввод контактных данных
    SendingOrder = 'sending', // Отправка на API сервера (без визуального отображения)
    Success = 'success'      // Успешное завершение заказа
}
```

События галереи - `GalleryEvent`:
```ts
enum GalleryEvent {
    ItemsChanged = 'gallery:items:changed',
    SelectionChanged = 'gallery:selection:changed',
}
```

События товаров - `ProductEvent`:
```ts
enum ProductEvent {
    CardClicked = 'product:card:clicked',
    ActionCalled = 'product:action_button:clicked',
}
```

События корзины - `CartEvent`:
```ts
enum CartEvent {
    ItemsChanged = 'cart:items:changed',
    IconClicked = 'cart:icon:clicked',
    ItemDeleteClicked = 'cart:item:delete_clicked',
    CheckoutClicked = 'cart:checkout:clicked',
}
```

События модального окна - `ModalEvent`:
```ts
enum ModalEvent {
    Opened = 'modal:opened',
    Closed = 'modal:closed',
}
```

Состояние валидации полей - `ValidityState`:

```ts
enum ValidityState {
    Invalid = 'invalid',     // При переходе в след шаг поле заполнено некорректно
    Incomplete = 'incomplete', // Поле заполнено некорректно (при реактивной валидации, ошибку не показываем)
    Valid = 'valid',         // Поле корректно заполнено
}
```

Валидность поля - `FieldValidity`:

```ts
type FieldValidity = {
    field: string;           // Имя поля
    state: ValidityState;    // Состояние валидации
    error: string;           // Сообщение об ошибке
};
```

Данные формы с валидацией - `FormData<T>`:

```ts
type FormData<T> = T & {
    validity: FieldValidity[]; // Массив состояний валидации полей
};
```

События модели заказа - `OrderEvent`:

```ts
enum OrderEvent {
    StepChanged = 'order:step:changed',           // Изменение текущего шага заказа
    DataChanged = 'order:request:changed',        // Обновление данных заказа
    ValidateRequest = 'order:request:validate',   // Запрос валидации данных
    ValidationFailed = 'order:validation:failed', // Ошибки валидации
    OrderFailed = 'order:response:received',      // Ошибка при оформлении заказа
    SubmitOrderTransaction = 'order:transaction:submit', // Отправка заказа
    SubmitStep = 'order:step:submit'             // Отправка шага заказа
}
```

Интерфейс модели заказа - `IOrderModel`:

```ts
interface IOrderModel {
    // Данные заказа
    orderData: IOrderRequest; // геттер
    orderResponse: IOrderResponse | null; // геттер, сеттер
    currentStep: OrderStep; // геттер

    // Методы для работы с данными
    setOrderData(step: OrderStep, data: Partial<IOrderRequest>): void;

    // Валидация
    validate(data: Partial<IOrderRequest>, strict: boolean): FieldValidity[];

    // Управление шагами
    submitStep(): void;
    reset(): OrderStep;
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
- `set items(value: IProduct[])` - сеттер для обновления каталога, генерирует событие `gallery:items:changed`
- `get selection(): TypeFrom<IProduct, 'id'> | null` - геттер для получения ID выбранного товара
- `set selection(value: TypeFrom<IProduct, 'id'>) | null` - сеттер для выбора товара, генерирует событие `gallery:selection:changed`

#### Класс CartModel
Класс отвечает за управление корзиной товаров, расчет общей стоимости и уведомление об изменениях.

**Основные поля:**
- `_items: TCartItem[]` - внутреннее хранилище товаров с ID и ценами
- `events: IEvents` - брокер событий для уведомления об изменениях

**Основные методы:**
- `addProduct(productData: TCartItem): void` - добавляет товар в корзину если его там еще нет и товар не бесценный (исключает товары с `price: null`)
- `removeProduct(productId: TypeFrom<IProduct, 'id'>): void` - удаляет товар из корзины
- `hasProduct(productId: TypeFrom<IProduct, 'id'>): boolean` - проверяет наличие товара в корзине
- `clear(): void` - очищает корзину (используется после успешного заказа)
- `get items(): TypeFrom<IProduct, 'id'>[]` - возвращает массив ID товаров в корзине
- `get totalCost(): number` - вычисляемое поле общей стоимости
- `get count(): number` - вычисляемое поле количества товаров
- `get isEmpty(): boolean` - вычисляемое поле проверки пустоты корзины

**События:**
- Генерирует `cart:items:changed` при любом изменении корзины

#### Класс OrderModel
Класс отвечает за управление процессом оформления заказа, валидацию данных и пошаговое заполнение формы заказа. Использует библиотеку valibot для валидации.

**Основные поля:**
- `_orderData: IOrderRequest` - данные заказа (полная структура)
- `_orderResponse: IOrderResponse | null` - ответ сервера после отправки заказа
- `_currentStep: OrderStep` - текущий шаг процесса оформления
- `events: IEvents` - брокер событий для уведомления об изменениях

**Основные методы:**
- `setOrderData(step: OrderStep, data: Partial<IOrderRequest>): void` - устанавливает данные заказа для конкретного шага с валидацией
- `validate(data: Partial<IOrderRequest>, strict: boolean): FieldValidity[]` - валидирует поля с помощью valibot схем. Не применяет их на модель 
- `submitStep(): void` - переход к следующему шагу с валидацией текущего
- `reset(): OrderStep` - сброс всех данных заказа и возврат к начальному шагу
- `get orderData(): IOrderRequest` - геттер для получения копии данных заказа
- `get/set orderResponse(): IOrderResponse | null` - геттер/сеттер для ответа сервера
- `get/set currentStep(): OrderStep` - геттер/сеттер для текущего шага

**Валидация с использованием valibot схем:**
- **PaymentMethodSchema**: проверяет выбор способа оплаты ('card' или 'cash')
- **IOrderRequestSchema**: полная схема валидации всего заказа
- **Поэтапная валидация**: различные поля проверяются в зависимости от текущего шага
- **Строгая валидация**: при `strict: true` требует заполнения всех полей

**Логика работы с шагами:**
- `Cart` → `Delivery`: проверяет наличие товаров
- `Delivery` → `Contacts`: проверяет способ оплаты и адрес
- `Contacts` → `SendingOrder`: проверяет контактные данные и отправляет транзакцию
- `SendingOrder` → `Success`: автоматический переход при успешном ответе

**События:**
- `OrderEvent.StepChanged` - при изменении текущего шага
- `OrderEvent.DataChanged` - при обновлении данных заказа
- `OrderEvent.ValidationFailed` - при ошибках валидации (передает массив `FieldValidity[]`)
- `OrderEvent.SubmitOrderTransaction` - при готовности отправить заказ на сервер
- `OrderEvent.OrderFailed` - при получении ошибки от сервера

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
- `buildPlaceholder(): HTMLElement` - создает элемент-заглушку для пустой коллекции

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
- `product:action_button:clicked` - при клике на кнопку действия (Купить/Убрать)

#### Класс ProductGalleryView
Компонент для отображения галереи товаров на главной странице.

**Наследуется от:** `Component<IProduct[]>`

**Основные методы:**
- `render(data?: Partial<IProduct[]>): HTMLElement` - отрисовывает список товаров в галерее

#### Класс CartIcon
Компонент иконки корзины в шапке сайта с счетчиком товаров.

**Наследуется от:** `Component<TCartInfo>`

**Принимаемые данные:** Объект типа `TCartInfo` (содержит `count`)

**Основные сеттеры (protected):**
- `set count(value: number)` - устанавливает количество товаров в счетчике корзины

**Основные методы:**
- `render(data?: Partial<TCartInfo>): HTMLElement` - обновляет компонент данными счетчика и возвращает DOM элемент

**Генерируемые события:**
- `cart:icon:clicked` - при клике на иконку корзины

#### Класс CartItemView
Компонент для отображения элемента корзины (товара в списке корзины).

**Наследуется от:** `Component<ICartItemData>`

**Принимаемые данные:** Объект типа `ICartItemData` (содержит `id`, `title`, `price`, `cartIndex`)

**Основные сеттеры (protected):**
- `set id(value: string)` - устанавливает ID товара для использования в событиях
- `set title(value: string)` - устанавливает название товара
- `set price(value: number | null)` - устанавливает цену товара
- `set cartIndex(value: number)` - устанавливает позицию товара в корзине (1, 2, 3...)

**Основные методы:**
- `render(data?: Partial<ICartItemData>): HTMLElement` - обновляет компонент данными элемента корзины и возвращает DOM элемент

**Генерируемые события:**
- `cart:item:delete_clicked` - при клике на кнопку удаления товара из корзины

#### Класс CartView
Компонент для отображения корзины с товарами, общей стоимостью и кнопкой оформления.

**Наследуется от:** `Component<ICartViewData>`

**Принимаемые данные:** Объект типа `ICartViewData` (содержит массив `items`, `totalCost`, `isEmpty`)

**Основные сеттеры (protected):**
- `set items(cartItems: ICartItemData[])` - устанавливает список товаров корзины. При пустом массиве показывает элемент с текстом "Корзина пуста" (через `itemFactory.buildPlaceholder()`), иначе создает CartItemView для каждого товара
- `set totalCost(value: number)` - устанавливает общую стоимость корзины
- `set isEmpty(value: boolean)` - управляет состоянием кнопки оформления (активна только при наличии товаров)

**Основные методы:**
- `render(data?: Partial<ICartViewData>): HTMLElement` - обновляет компонент данными корзины и возвращает DOM элемент

**Генерируемые события:**
- `cart:checkout:clicked` - при клике на кнопку "Оформить"

**Конфигурация:** Требует `CartViewConfig` с обязательным `itemFactory` для создания элементов корзины

#### Класс Modal
Компонент модального окна для отображения различного контента.

**Наследуется от:** `Component<IModalData>`

**Основные методы:**
- `open(): void` - открывает модальное окно
- `close(): void` - закрывает модальное окно
- `isOpened(): boolean` - проверяет, открыто ли модальное окно
- `render(data?: Partial<IModalData>): HTMLElement` - обновляет содержимое модального окна

**Генерируемые события:**
- `modal:opened` - при открытии модального окна
- `modal:closed` - при закрытии модального окна

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
- `buildPlaceholder(): HTMLElement` - создает заглушку (не используется в текущей реализации)

#### Класс CartItemFactory
Фабрика для создания компонентов CartItemView.

**Реализует интерфейс:** `IComponentFactory<ICartItemData>`

**Конструктор принимает:**
- `templateSelector: string | HTMLTemplateElement` - селектор или элемент HTML шаблона (`#card-basket`)
- `events?: IEvents` - брокер событий (опционально)
- `config?: Partial<CartItemViewConfig>` - конфигурация компонента (опционально)

**Основные методы:**
- `build(): IComponent<ICartItemData>` - создает новый экземпляр CartItemView на основе шаблона корзины
- `buildPlaceholder(): HTMLElement` - создает элемент с надписью "Корзина пуста" для отображения в пустой корзине

### Презентер

Логика связывания слоев реализована в файле `src/index.ts` через систему событий.

## Таблица событий приложения

| Enum поле | Текстовое значение | Источник события | Описание |
|-----------|-------------------|------------------|----------|
| **GalleryEvent.ItemsChanged** | `gallery:items:changed` | ProductGalleryModel | Обновление списка товаров в галерее |
| **GalleryEvent.SelectionChanged** | `gallery:selection:changed` | ProductGalleryModel | Изменение выбранного товара для детального просмотра |
| **ProductEvent.CardClicked** | `product:card:clicked` | ProductGalleryView | Клик по карточке товара в галерее (выбор для детального просмотра) |
| **ProductEvent.ActionCalled** | `product:action_button:clicked` | ProductView | Клик по кнопке действия с товаром (добавить/убрать из корзины) |
| **CartEvent.ItemsChanged** | `cart:items:changed` | CartModel | Изменение содержимого корзины (добавление/удаление товаров) |
| **CartEvent.IconClicked** | `cart:icon:clicked` | CartIcon | Клик по иконке корзины в шапке сайта |
| **CartEvent.ItemDeleteClicked** | `cart:item:delete_clicked` | CartItemView | Клик по кнопке удаления товара из корзины |
| **CartEvent.CheckoutClicked** | `cart:checkout:clicked` | CartView | Клик по кнопке "Оформить" в корзине |
| **ModalEvent.Opened** | `modal:opened` | Modal | Открытие модального окна |
| **ModalEvent.Closed** | `modal:closed` | Modal | Закрытие модального окна |
| **OrderEvent.StepChanged** | `order:step:changed` | OrderModel | Изменение текущего шага процесса оформления заказа |
| **OrderEvent.DataChanged** | `order:request:changed` | OrderModel | Обновление данных заказа (адрес, контакты и т.д.) |
| **OrderEvent.ValidateRequest** | `order:request:validate` | OrderModel | Запрос валидации данных |
| **OrderEvent.ValidationFailed** | `order:validation:failed` | OrderModel | Ошибки валидации при заполнении данных заказа |
| **OrderEvent.OrderFailed** | `order:response:received` | OrderModel | Ошибка при оформлении заказа (в ответе от API) |
| **OrderEvent.SubmitOrderTransaction** | `order:transaction:submit` | OrderModel | Отправка заказа на сервер |
| **OrderEvent.SubmitStep** | `order:step:submit` | OrderModel | Запрос перехода на следующий шаг заказа |
