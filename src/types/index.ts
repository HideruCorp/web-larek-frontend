import { IEvents } from '../components/base/events';
import { TypeFrom } from '../utils/utils';

export interface IProduct {
	id: string; // UUID идентификатор товара
	title: string; // Название товара
	description: string; // Подробное описание товара
	image: string; // Путь к изображению товара (требует CDN_URL)
	price: number | null; // Цена в синансах или null для бесценных товаров
	category: string; // Категория товара
}

export type PaymentMethod = 'online' | 'cash' | '';

export interface IOrderRequest {
	payment: PaymentMethod; // Способ оплаты
	address: string; // Адрес доставки (обязательное поле)
	email: string; // Email покупателя (обязательное поле)
	phone: string; // Телефон покупателя (обязательное поле)
	total: number; // Общая сумма заказа (проверяется сервером!)
	items: TypeFrom<IProduct, 'id'>[]; // Массив UUID товаров из корзины
}

export interface IOrderResponse {
	id: string; // Id заказа
	total: number; // Общая сумма заказа
}

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

export interface IProductGalleryModel {
	items: IProduct[]; // массив товаров, геттер и сеттер
	selection: TypeFrom<IProduct, 'id'> | null; // ID выбранного товара (для работы модального окна с деталями товара)

	getProduct(productId: TypeFrom<IProduct, 'id'>): IProduct | null;
}

export interface IProductViewData extends IProduct {
	inCart: boolean;
}

export type TCartItem = Pick<IProduct, 'id' | 'price'>;

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

export interface ICartModelConstructor {
	new (events: IEvents): ICartModel;
}

export interface IComponent<T = unknown> {
	render(data?: Partial<T>): HTMLElement;
}

export interface IComponentFactory<T> {
	build(): IComponent<T>;
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

