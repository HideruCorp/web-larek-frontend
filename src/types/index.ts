import { IEvents } from '../components/base/events';
import { TypeFrom } from '../utils/utils';

export interface IProduct {
	id: string; // UUID идентификатор товара
	title: string; // Название товара
	description: string; // Подробное описание товара
	image: string; // Путь к изображению товара
	price: number | null; // Цена в синансах или null для бесценных товаров
	category: string; // Категория товара
}

export type PaymentMethod = 'card' | 'cash' | '';

export interface IOrderRequest {
	payment: PaymentMethod; // Способ оплаты
	address: string; // Адрес доставки
	email: string; // Email покупателя
	phone: string; // Телефон покупателя
	total: number; // Общая сумма заказа
	items: TypeFrom<IProduct, 'id'>[]; // Массив UUID товаров
}

export type TOrderSuccess = {
	id: string; // Id заказа
	total: number; // Общая сумма заказа
};

export type TOrderError = {
	error: string; // Сообщение об ошибке
};

export type IOrderResponse = TOrderSuccess | TOrderError;

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export interface IApi {
	baseUrl: string;
	get<T>(uri: string): Promise<T>;
	post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface ILarekApi {
	getProducts(): Promise<IProduct[]>;
	sendOrder(orderData: IOrderRequest): Promise<IOrderResponse>;
}

export enum GalleryEvent {
	ItemsChanged = 'gallery:items:changed',
	SelectionChanged = 'gallery:selection:changed',
}

export interface IProductModel {
	items: IProduct[]; // массив товаров
	selection: TypeFrom<IProduct, 'id'> | null; // ID выбранного товара

	getProduct(productId: TypeFrom<IProduct, 'id'>): IProduct | null;
}

export interface IProductViewData extends IProduct {
	inCart: boolean;
}

export type TCartItem = Pick<IProduct, 'id' | 'price'>;

export interface ICartItemData
	extends Pick<IProduct, 'id' | 'title' | 'price'> {
	cartIndex: number; // Позиция в корзине
}

export interface ICartViewData {
	items: ICartItemData[]; // Массив товаров
	totalCost: number;
	isEmpty: boolean;
}

export enum CartEvent {
	ItemsChanged = 'cart:items:changed',
	IconClicked = 'cart:icon:clicked',
	ItemDeleteClicked = 'cart:item:delete_clicked',
	CheckoutClicked = 'cart:checkout:clicked',
}

export interface ICartModel {
	items: TypeFrom<IProduct, 'id'>[];
	totalCost: number;
	count: number;
	isEmpty: boolean;

	addProduct(productData: TCartItem): void;
	removeProduct(productId: TypeFrom<IProduct, 'id'>): void;
	hasProduct(productId: TypeFrom<IProduct, 'id'>): boolean;
	clear(): void;
}

export type TCartInfo = Pick<ICartModel, 'count'>;

export interface ICartModelConstructor {
	new (events: IEvents): ICartModel;
}

export interface IComponent<T = unknown> {
	render(data?: Partial<T>): HTMLElement;
}

export interface IComponentFactory<T> {
	build(): IComponent<T>;
	buildPlaceholder(): HTMLElement;
}

export type IModalData = {
	content: HTMLElement;
};

export interface IModal {
	render(data: IModalData): HTMLElement;
	open(): void;
	close(): void;
	isOpened(): boolean;
}

export type ModalConfig = {
	contentSelector: string;
	closeButtonSelector: string;
	openedModifier: string;
};

export enum ModalEvent {
	Opened = 'modal:opened',
	Closed = 'modal:closed',
}

export enum ProductEvent {
	CardClicked = 'product:card:clicked',
	ActionCalled = 'product:action_button:clicked',
}

export type ProductViewConfig = {
	itemSelectable: boolean;
	domSelectors: {
		categorySelector: string;
		titleSelector: string;
		descriptionSelector: string;
		imageSelector: string;
		priceSelector: string;
		actionButtonSelector: string;
	};
	categoryClassMap: Record<string, string>;
};

export type ProductGalleryViewConfig = {
	itemFactory?: IComponentFactory<IProduct>;
};

export type CartIconConfig = {
	counterSelector: string;
};

export type CartItemViewConfig = {
	indexSelector: string;
	titleSelector: string;
	priceSelector: string;
	removeButtonSelector: string;
};

export type CartItemFactoryConfig = {
	itemConfig?: Partial<CartItemViewConfig>;
	placeholder: {
		classList: string;
		elementName: keyof HTMLElementTagNameMap;
		text: string;
	};
};

export type CartViewConfig = {
	listSelector: string;
	totalSelector: string;
	checkoutSelector: string;
	itemFactory?: IComponentFactory<ICartItemData>;
};

export type TOrderItems = Pick<IOrderRequest, 'items' | 'total'>;
export type TOrderParameters = Omit<IOrderRequest, 'items' | 'total'>;
export type TOrderContacts = Pick<IOrderRequest, 'email' | 'phone'>;
export type TOrderDelivery = Pick<IOrderRequest, 'payment' | 'address'>;

export type TOrderChangeRequest = {
	changedData: Partial<TOrderParameters>;
};

export enum ValidityState {
	Invalid = 'invalid',
	Incomplete = 'incomplete',
	Valid = 'valid',
}

export type FieldValidity = {
	field: string;
	state: ValidityState;
	error: string;
};

export type FormData<T> = T & {
	validity: FieldValidity[];
};

export type FormViewConfig = {
	submitButtonSelector: string;
	errorSelector?: string;
}

export enum OrderStep {
	Cart = 'cart',
	Delivery = 'delivery',
	Contacts = 'contacts',
	SendingOrder = 'sending',
	Success = 'success',
}

export enum OrderEvent {
	StepChanged = 'order:step:changed',
	DataChanged = 'order:request:changed',
	ChangeRequest = 'order:form:change',
	ValidationFailed = 'order:validation:failed',
	OrderFailed = 'order:response:received',
	SubmitOrderTransaction = 'order:transaction:submit',
	SubmitStep = 'order:step:submit',
	SuccessClose = 'order:success:close_clicked',
}

export interface IOrderModel {
	orderParameters: TOrderParameters;
	orderResponse: IOrderResponse | null;
	currentStep: OrderStep;
	setOrderParameters(data: Partial<TOrderParameters>): void;
	validate(data: Partial<TOrderParameters>): FieldValidity[];
	submitStep(): void;
	reset(): OrderStep;
}

export type OrderDeliveryViewConfig = FormViewConfig & {
	paymentButtonSelector: string;
	paymentMethodMapping: {
		name: string;
		method: PaymentMethod;
	}[];
	addressInputSelector: string;
	activeButtonModifier: string;
};

export type OrderContactsViewConfig = FormViewConfig & {
	emailInputSelector: string;
	phoneInputSelector: string;
};

export type OrderSuccessViewConfig = {
	totalSelector: string;
	closeButtonSelector: string;
};

export interface IAppPresenterDependencies {
	events: IEvents;
	larekApi: ILarekApi;
	modal: IModal;
	product: {
		productModel: IProductModel;
		productGalleryView: IComponent<IProduct[]>;
		productDetailView: IComponent<IProductViewData>;
	};
	cart: {
		cartModel: ICartModel;
		cartIcon: IComponent<TCartInfo>;
		cartView: IComponent<ICartViewData>;
	};
	order: {
		orderModel: IOrderModel;
		orderDeliveryView: IComponent<FormData<TOrderDelivery>>;
		orderContactsView: IComponent<FormData<TOrderContacts>>;
		orderSuccessView: IComponent<TOrderSuccess>;
	};
}
