# Проектная работа "Веб-ларек"

## Описание
Интернет-магазин товаров для веб-разработчиков с каталогом, корзиной и пошаговым оформлением заказа. Проект реализован на основе MVP архитектуры с использованием событийной системы для связи компонентов.

## Функциональность
- **Каталог товаров** - отображение товаров с сервера в виде карточек
- **Детальный просмотр товара** - модальное окно с подробной информацией
- **Корзина покупок** - добавление/удаление товаров, расчет общей стоимости  
- **Оформление заказа** - двухэтапный процесс: способ оплаты/доставка -> контактные данные
- **Валидация форм** - проверка обязательных полей на каждом шаге
- **Обработка бесценных товаров** - товары с `price: null` недоступны для покупки

## Стек технологий
- **TypeScript** - строгая типизация и современный JS
- **HTML/SCSS** - семантическая разметка и стилизация
- **Webpack** - сборка проекта и dev-server
- **EventEmitter** - система событий для MVP архитектуры

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с TS компонентами
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

```typescript
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

```typescript
type PaymentMethod = 'card' | 'cash' | '';
```

Заказ для отправки на сервер - `IOrderRequest`:

```typescript
interface IOrderRequest {
    payment: PaymentMethod; // Способ оплаты
    address: string; // Адрес доставки
    email: string; // Email покупателя
    phone: string; // Телефон покупателя
    total: number; // Общая сумма заказа
    items: TypeFrom<IProduct, 'id'>[]; // Массив UUID товаров из корзины
}
```

Типы ответа сервера при заказе:

Успешный ответ - `TOrderSuccess`:

```typescript
type TOrderSuccess = {
    id: string; // Id заказа
    total: number; // Общая сумма заказа
};
```

Ошибка заказа - `TOrderError`:

```typescript
type TOrderError = {
    error: string; // Сообщение об ошибке
};
```

Общий тип ответа - `IOrderResponse`:

```typescript
type IOrderResponse = TOrderSuccess | TOrderError;
```

API для работы с сервером веб-ларька - `ILarekApi`:

```typescript
interface ILarekApi {
    getProducts(): Promise<IProduct[]>; // Получение каталога товаров
    sendOrder(orderData: IOrderRequest): Promise<IOrderResponse>; // Отправка заказа
}
```

Галерея товаров на главной странице - `IProductModel`:

```typescript
interface IProductModel {
    items: IProduct[]; // Массив товаров
    selection: TypeFrom<IProduct, 'id'> | null; // ID выбранного товара для модального окна

    getProduct(productId: TypeFrom<IProduct, 'id'>): IProduct | null;
}
```

Данные галереи товаров - `IGalleryViewData`:

```typescript
interface IGalleryViewData {
    items: IProduct[]; // Массив товаров для отображения в галерее
}
```

Данные товара для отображения в карточке - `IProductViewData`:

```typescript
interface IProductViewData extends IProduct {
    inCart: boolean; // Находится ли товар в корзине
}
```

Базовые данные товара - `IBaseProductData`:

```typescript
type IBaseProductData = Pick<IProduct, 'id' | 'title' | 'price'>;
```

Данные товара для корзины - `TCartItem`:

```typescript
type TCartItem = Pick<IProduct, 'id' | 'price'>;
```

Корзина - `ICartModel`:

```typescript
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

```typescript
interface ICartItemData extends IBaseProductData {
    cartIndex: number; // Позиция товара в корзине (1, 2, 3...)
}
```

Данные корзины для отображения - `ICartViewData`:

```typescript
interface ICartViewData {
    items: ICartItemData[]; // Массив товаров корзины с индексами
    totalCost: number; // Общая стоимость корзины
    isEmpty: boolean; // Пустая ли корзина
}
```

Информация о корзине для иконки - `TCartInfo`:

```typescript
type TCartInfo = Pick<ICartModel, 'count'>;
```

Типы данных для конкретных шагов оформления заказа:
- Товары для оформления заказа - `TOrderItems`
- Параметры заказа без товаров и суммы - `TOrderParameters`
- Данные по оплате и доставке товара при оформлении заказа - `TOrderDelivery`
- Контактные данные получателя при оформлении заказа - `TOrderContacts`

```typescript
type TOrderItems = Pick<IOrderRequest, 'items' | 'total'>;
type TOrderParameters = Omit<IOrderRequest, 'items' | 'total'>;
type TOrderDelivery = Pick<IOrderRequest, 'payment' | 'address'>;
type TOrderContacts = Pick<IOrderRequest, 'email' | 'phone'>;
```

Тип для события изменения полей формы заказа - `TOrderChangeRequest`:

```typescript
type TOrderChangeRequest = {
    changedData: Partial<TOrderParameters>; // Изменившиеся поля
};
```

Шаги оформления заказа - `OrderStep`:

```typescript
enum OrderStep {
    Cart = 'cart',           // Корзина, процесс оформления не начат
    Delivery = 'delivery',   // Выбор способа оплаты и адреса доставки
    Contacts = 'contacts',   // Ввод контактных данных
    SendingOrder = 'sending', // Отправка на API сервера
    Success = 'success'      // Успешное завершение заказа
}
```

События галереи - `GalleryEvent`:

```typescript
enum GalleryEvent {
    ItemsChanged = 'gallery:items:changed',
    SelectionChanged = 'gallery:selection:changed',
}
```

События товаров - `ProductEvent`:

```typescript
enum ProductEvent {
    CardClicked = 'product:card:clicked',
    ActionCalled = 'product:action_button:clicked',
}
```

События корзины - `CartEvent`:

```typescript
enum CartEvent {
    ItemsChanged = 'cart:items:changed',
    IconClicked = 'cart:icon:clicked',
    ItemDeleteClicked = 'cart:item:delete_clicked',
    CheckoutClicked = 'cart:checkout:clicked',
}
```

События модального окна - `ModalEvent`:

```typescript
enum ModalEvent {
    Opened = 'modal:opened',
    Closed = 'modal:closed',
}
```

Состояние валидации полей - `ValidityState`:

```typescript
enum ValidityState {
    Invalid = 'invalid',     // При переходе в след шаг поле заполнено некорректно
    Incomplete = 'incomplete', // Поля частично заполнены
    Valid = 'valid',         // Поле корректно заполнено
}
```

Валидность поля - `FieldValidity`:

```typescript
type FieldValidity = {
    field: string;           // Имя поля
    state: ValidityState;    // Состояние валидации
    error: string;           // Сообщение об ошибке
};
```

Данные формы с валидацией - `FormData<T>`:

```typescript
type FormData<T> = T & {
    validity: FieldValidity[]; // Массив состояний валидации полей
};
```

Базовая конфигурация форм - `FormViewConfig`:

```typescript
type FormViewConfig = {
    submitButtonSelector: string;   // Селектор кнопки отправки формы
    errorSelector?: string;         // Селектор элемента ошибок (опционально)
};
```

События модели заказа - `OrderEvent`:

```typescript
enum OrderEvent {
    StepChanged = 'order:step:changed',           // Изменение текущего шага заказа
    DataChanged = 'order:request:changed',        // Обновление данных заказа
    ChangeRequest = 'order:form:change',          // Запрос изменения поля формы заказа
    ValidationFailed = 'order:validation:failed', // Ошибки валидации
    OrderFailed = 'order:response:received',      // Ошибка при оформлении заказа
    SubmitOrderTransaction = 'order:transaction:submit', // Отправка заказа
    SubmitStep = 'order:step:submit',            // Отправка шага заказа
    SuccessClose = 'order:success:close_clicked'  // Закрытие экрана успешного заказа
}
```

Интерфейс модального окна - `IModal`:

```typescript
interface IModal extends IComponent<IModalData> {
    open(): void;
    close(): void;
    isOpened: boolean;
}
```

Данные модального окна - `IModalData`:

```typescript
type IModalData = {
    content: HTMLElement;
};
```

Интерфейс модели заказа - `IOrderModel`:

```typescript
interface IOrderModel {
    orderParameters: TOrderParameters;
    orderResponse: IOrderResponse | null;
    currentStep: OrderStep; // геттер

    // Методы для работы с данными
    setOrderParameters(data: Partial<TOrderParameters>): void;

    // Валидация
    validate(data: Partial<TOrderParameters>): FieldValidity[];

    // Управление шагами
    submitStep(): void;
    reset(): OrderStep;
}
```

**Примечание:** Для основных типов конфигурации компонентов прописаны значения по умолчанию в `src/utils/constants.ts`.

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

#### Класс ProductModel
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
Класс отвечает за управление процессом оформления заказа, валидацию параметров формы и пошаговое заполнение. Использует библиотеку valibot для валидации.

**Основные поля:**
- `_orderData: TOrderParameters` - параметры формы заказа
- `_orderResponse: IOrderResponse | null` - ответ сервера после отправки заказа
- `_currentStep: OrderStep` - текущий шаг процесса оформления
- `events: IEvents` - брокер событий для уведомления об изменениях

**Основные методы:**
- `setOrderParameters(data: Partial<TOrderParameters>): void` - устанавливает параметры заказа с валидацией, обновляет только валидные или неполные поля
- `validate(data: Partial<TOrderParameters>): FieldValidity[]` - валидирует параметры с помощью valibot схем
- `submitStep(): void` - переход к следующему шагу с валидацией текущего
- `reset(): OrderStep` - сброс всех параметров заказа и возврат к начальному шагу
- `get orderParameters(): TOrderParameters` - геттер для получения копии параметров заказа
- `get/set orderResponse(): IOrderResponse | null` - геттер/сеттер для ответа сервера
- `get/set currentStep(): OrderStep` - геттер/сеттер для текущего шага

**Валидация с использованием valibot схем:**
- **PaymentMethodSchema**: проверяет выбор способа оплаты ('card' или 'cash')
- **TOrderParametersSchema**: схема валидации параметров формы (без товаров и суммы)
- **Поэтапная валидация**: различные поля проверяются в зависимости от текущего шага

**Логика работы с шагами:**
- `Cart` -> `Delivery`: переход инициируется презентером
- `Delivery` -> `Contacts`: проверяет способ оплаты и адрес
- `Contacts` -> `SendingOrder`: проверяет контактные данные и отправляет событие транзакции
- `SendingOrder` -> `Success`: автоматический переход при успешном ответе

**События:**
- `OrderEvent.StepChanged` - при изменении текущего шага
- `OrderEvent.DataChanged` - при валидном обновлении параметров заказа
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

**Система автоматического рендеринга полей:**
- `addRenderField(property: string, dependencies?: FieldDependencies<T>): void` - регистрирует поле в реестре представления компонента для автоматического рендеринга
- `applyRegisteredFields(data: Partial<T>): void` - задает новые данные в зарегистрированные поля
- `render(data?: Partial<T>): HTMLElement` - базовый рендер с автоматическим обновлением зарегистрированных полей

Система позволяет компонентам автоматически обновлять свои поля при вызове `render()`, избегая необходимости явного вызова сеттеров в каждом компоненте.

#### Базовый класс FormComponent<T>
Абстрактный класс для всех форм приложения. Наследуется от `Component<FormData<T>>` и предоставляет общую логику управления формами с валидацией.

**Наследуется от:** `Component<FormData<T>>`

**Основные поля:**
- `_formElement: HTMLFormElement` - элемент формы
- `_errorElement?: HTMLElement` - элемент для отображения ошибок (необязательный)
- `_submitButton: HTMLButtonElement` - кнопка отправки формы

**Основные методы:**
- `protected abstract onSubmit(): void` - абстрактный метод обработки отправки формы
- `protected set validity(validity: FieldValidity[]): void` - обработка результатов валидации, управление состоянием кнопки и отображением ошибок

**Логика валидации:**
- Отображает первую критическую ошибку (`ValidityState.Invalid`) и блокирует кнопку отправки
- При отсутствии критических ошибок показывает сообщение о незаполненных (`ValidityState.Incomplete`) только если хотя бы одно из полей формы заполнено
- Активирует кнопку отправки только когда все поля валидны

**Принцип использования:**
- Наследующие классы должны реализовать `onSubmit` для обработки отправки формы
- Класс автоматически обрабатывает события `submit` формы с предотвращением стандартного поведения
- Регистрирует в реестре представления компонента поле `validity`

#### Класс Modal
Компонент модального окна для отображения различного контента. Реализует интерфейс `IModal`.

**Наследуется от:** `Component<IModalData>`

**Основные методы:**
- `open(): void` - открывает модальное окно
- `close(): void` - закрывает модальное окно
- `get isOpened(): boolean` - геттер, проверяющий открыто ли модальное окно
- `protected set content(value: HTMLElement): void` - устанавливает содержимое модального окна

**Генерируемые события:**
- `modal:opened` - при открытии модального окна
- `modal:closed` - при закрытии модального окна

**Рендеринг:** 
- Регистрирует в реестре представления компонента поле `content`

#### Класс BaseProductView<T>
Абстрактный базовый класс для отображения данных товара. Предоставляет общую функциональность для всех компонентов товаров.

**Наследуется от:** `Component<T extends IBaseProductData>`

**Основные сеттеры (protected):**
- `set id(value: string)` - устанавливает ID товара для использования в событиях
- `set title(value: string)` - устанавливает название товара
- `set price(value: number | null)` - устанавливает цену (или "Бесценно")

**Использование системы автоматического рендеринга:**
- Регистрирует в реестре представления компонента поля `id` (не имеет визуального отображения), `title`, `price`

#### Класс ProductView
Компонент для отображения карточки товара.

**Наследуется от:** `BaseProductView<IProductViewData>`

**Принимаемые данные:** Объект типа `IProductViewData` (расширенный `IProduct` с полем `inCart: boolean`)

**Основные сеттеры (protected):**
- `set description(value: string)` - устанавливает описание товара
- `set image(value: string)` - устанавливает изображение товара
- `set category(value: string)` - устанавливает категорию с соответствующим цветом
- `set inCart(value: Pick<IProductViewData, 'inCart' | 'price'>)` - управляет состоянием кнопки (В корзину/Удалить/Недоступно)

**Генерируемые события:**
- `product:action_button:clicked` - при клике на кнопку действия (Купить/Убрать)

#### Класс ProductGalleryView
Компонент для отображения галереи товаров на главной странице.

**Наследуется от:** `Component<IGalleryViewData>`

**Принимаемые данные:** Объект типа `IGalleryViewData`

**Основные сеттеры (protected):**
- `set items(products: IProduct[])` - устанавливает список товаров в галерее, создавая для каждого элемент через фабрику

**Рендеринг:** 
- Регистрирует в реестре представления компонента поле `items`

#### Класс CartIcon
Компонент иконки корзины в шапке сайта с счетчиком товаров.

**Наследуется от:** `Component<TCartInfo>`

**Принимаемые данные:** Объект типа `TCartInfo` (содержит `count`)

**Основные сеттеры (protected):**
- `set count(value: number)` - устанавливает количество товаров в счетчике корзины

**Рендеринг:** 
- Регистрирует в реестре представления компонента поле `count`

**Генерируемые события:**
- `cart:icon:clicked` - при клике на иконку корзины

#### Класс CartItemView
Компонент для отображения элемента корзины (товара в списке корзины).

**Наследуется от:** `BaseProductView<ICartItemData>`

**Принимаемые данные:** Объект типа `ICartItemData` (содержит `id`, `title`, `price`, `cartIndex`)

**Дополнительные сеттеры (protected):**
- `set cartIndex(value: number)` - устанавливает позицию товара в корзине (1, 2, 3...)

**Рендеринг:** 
- Дополнительно регистрирует в реестре представления компонента поле `cartIndex` (наследует базовые поля от `BaseProductView`)

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

**Рендеринг:** 
- Регистрирует в реестре представления компонента поля `items`, `totalCost`, `isEmpty`

**Генерируемые события:**
- `cart:checkout:clicked` - при клике на кнопку "Оформить"

**Конфигурация:** Требует `CartViewConfig` с обязательным `itemFactory` для создания элементов корзины

#### Класс OrderDeliveryView
Компонент для первого шага оформления заказа - выбор способа оплаты и адреса доставки.

**Наследуется от:** `FormComponent<TOrderDelivery>`

**Принимаемые данные:** Объект типа `TOrderDelivery` (содержит `payment`, `address`)

**Основные поля:**
- `_paymentButtons: HTMLButtonElement[]` - массив кнопок выбора способа оплаты
- `_addressInput: HTMLInputElement` - поле ввода адреса доставки

**Основные сеттеры (protected):**
- `set payment(value: PaymentMethod)` - устанавливает активный способ оплаты (card/cash), переключает состояние кнопок
- `set address(value: string)` - устанавливает адрес доставки в поле ввода

**Основные методы:**
- `protected renderForm(data: Partial<TOrderDelivery>): HTMLElement` - рендеринг данных формы доставки
- `protected onSubmit(): void` - обработка отправки формы, генерирует `OrderEvent.SubmitStep`

**Принцип работы:**
- **Наследует валидацию** от `FormComponent`
- При изменении каждого поля отправляется `OrderEvent.ChangeRequest` с измененными данными

**Генерируемые события:**
- `order:form:change` - при изменении способа оплаты или адреса (отправляет `TOrderChangeRequest`)
- `order:step:submit` - при клике на кнопку "Далее" (через `onSubmit`)

#### Класс OrderContactsView
Компонент для второго шага оформления заказа - ввод контактных данных (email и телефон).

**Наследуется от:** `FormComponent<TOrderContacts>`

**Принимаемые данные:** Объект типа `TOrderContacts` (содержит `email`, `phone`)

**Основные поля:**
- `_emailInput: HTMLInputElement` - поле ввода email
- `_phoneInput: HTMLInputElement` - поле ввода телефона

**Основные сеттеры (protected):**
- `set email(value: string)` - устанавливает email в поле ввода
- `set phone(value: string)` - устанавливает телефон в поле ввода

**Основные методы:**
- `protected renderForm(data: Partial<TOrderContacts>): HTMLElement` - рендеринг данных формы контактов
- `protected onSubmit(): void` - обработка отправки формы, генерирует `OrderEvent.SubmitStep`

**Принцип работы:**
- **Наследует валидацию** от `FormComponent`
- При изменении каждого поля отправляется `OrderEvent.ChangeRequest` с измененными данными

**Генерируемые события:**
- `order:form:change` - при изменении email или телефона (отправляет `TOrderChangeRequest`)
- `order:step:submit` - при клике на кнопку "Оплатить" (через `onSubmit`)

#### Класс OrderSuccessView
Компонент экрана успешного оформления заказа.

**Наследуется от:** `Component<TOrderSuccess>`

**Принимаемые данные:** Объект типа `TOrderSuccess` (содержит `id` и `total`)

**Основные сеттеры (protected):**
- `set total(value: number)` - устанавливает общую сумму заказа в формате "Списано X синансов"

**Рендеринг:** 
- Регистрирует в реестре представления компонента поле `total`

**Генерируемые события:**
- `order:success:close_clicked` - при клике на кнопку закрытия экрана успеха

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

**Реализует интерфейс:** `ILarekApi`

**Основные методы:**
- `getProducts(): Promise<IProduct[]>` - получает каталог товаров с сервера, автоматически добавляет CDN_URL к изображениям
- `sendOrder(orderData: IOrderRequest): Promise<IOrderResponse>` - отправляет заказ на сервер

**API Endpoints:**
- `GET /product` -> `{total: number, items: IProduct[]}` - получение каталога
- `POST /order` -> `{id: string, total: number}` - создание заказа

### Презентер

Логика связывания слоев реализована в классе `AppPresenter` (`src/components/AppPresenter.ts`) и инициализируется в файле `src/index.ts` через систему событий.

#### Класс AppPresenter
Основной класс презентера, который координирует взаимодействие между всеми компонентами приложения.

**Основные обязанности:**
- Инициализация всех компонентов приложения через зависимости
- Настройка обработчиков событий для связи между слоями
- Загрузка начальных данных с сервера

**Конструктор принимает:** `IAppPresenterDependencies` - объект со всеми необходимыми зависимостями (модели, представления, API)

**Основные методы:**
- `loadInitialData(): void` - загружает каталог товаров с сервера при запуске приложения

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
| **OrderEvent.ChangeRequest** | `order:form:change` | OrderDeliveryView, OrderContactsView | Запрос изменения поля формы заказа (отправляет `TOrderChangeRequest`) |
| **OrderEvent.ValidationFailed** | `order:validation:failed` | OrderModel | Ошибки валидации при заполнении данных заказа |
| **OrderEvent.OrderFailed** | `order:response:received` | OrderModel | Ошибка при оформлении заказа (в ответе от API) |
| **OrderEvent.SubmitOrderTransaction** | `order:transaction:submit` | OrderModel | Отправка заказа на сервер |
| **OrderEvent.SubmitStep** | `order:step:submit` | OrderDeliveryView, OrderContactsView | Запрос перехода на следующий шаг заказа |
| **OrderEvent.SuccessClose** | `order:success:close_clicked` | OrderSuccessView | Клик по кнопке закрытия экрана успешного заказа |
