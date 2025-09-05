import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { LarekApi } from './components/LarekApi';
import { ProductViewFactory } from './components/product/ProductViewFactory';
import { ProductGalleryView } from './components/product/ProductGalleryView';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement, TypeFrom, cloneTemplate, pick } from './utils/utils';
import { Modal } from './components/common/Modal';
import { ProductGalleryModel } from './components/product/ProductGalleryModel';
import {
	IProduct,
	IProductViewData,
	TCartItem,
	ICartItemData,
	ICartViewData,
	OrderStep,
	OrderEvent,
	IOrderRequest,
	ProductEvent,
	GalleryEvent,
	ModalEvent,
	CartEvent,
	FieldValidity,
	TOrderError,
	ValidityState,
} from './types';
import { CartModel } from './components/cart/CartModel';
import { CartView } from './components/cart/CartView';
import { CartIcon } from './components/cart/CartIcon';
import { CartItemFactory } from './components/cart/CartItemFactory';
import { OrderModel } from './components/order/OrderModel';
import { OrderDeliveryView } from './components/order/OrderDeliveryView';
import { OrderContactsView } from './components/order/OrderContactsView';
import { ProductView } from './components/product/ProductView';

const galleryContainer = ensureElement<HTMLElement>('.gallery');
const cartIconElement = ensureElement<HTMLElement>('.header__basket');
const modalElement = ensureElement<HTMLElement>('#modal-container');

const cartContainer = cloneTemplate<HTMLElement>('#basket');
const productDetailElement = cloneTemplate<HTMLElement>('#card-preview');
const orderDeliveryElement = cloneTemplate<HTMLElement>('#order');
const orderContactsElement = cloneTemplate<HTMLElement>('#contacts');
// const successElement = cloneTemplate<HTMLElement>('#success');

const events = new EventEmitter();
const larekApi = new LarekApi(new Api(API_URL), { cdnUrl: CDN_URL });

const productCardFactory = new ProductViewFactory('#card-catalog', events);
const productDetailView = new ProductView(productDetailElement, events, {
	itemSelectable: false,
});
const productGalleryView = new ProductGalleryView(galleryContainer, events, {
	itemFactory: productCardFactory,
});

const modal = new Modal(modalElement, events);

const galleryModel = new ProductGalleryModel(events);
const cartModel = new CartModel(events);
const orderModel = new OrderModel(events);

const cartIcon = new CartIcon(cartIconElement, events);
const cartItemFactory = new CartItemFactory('#card-basket', events);
const cartView = new CartView(cartContainer, events, {
	itemFactory: cartItemFactory,
});

const orderDeliveryView = new OrderDeliveryView(orderDeliveryElement, events);
const orderContactsView = new OrderContactsView(orderContactsElement, events);

events.on(
	ProductEvent.CardClicked,
	(item: { id: TypeFrom<IProduct, 'id'> }) => {
		console.log(`Получили клик по элементу с id: ${item.id}`);
		if (modal.isOpened()) {
			console.warn(
				'При открытом модальном окне элементы галлереи не кликабельны'
			);
			return;
		}
		galleryModel.selection = item.id;
	}
);

events.on(
	ProductEvent.ActionCalled,
	(item: { id: TypeFrom<IProduct, 'id'> }) => {
		console.log(`Кликнули по кнопке в превью: ${item.id}`);
		if (!cartModel.hasProduct(item.id)) {
			const cartItem: TCartItem = galleryModel.getProduct(item.id);
			cartModel.addProduct(cartItem);
		} else {
			cartModel.removeProduct(item.id);
		}
	}
);

events.on(CartEvent.ItemsChanged, () => {
	console.log(`Изменился список в корзине: ${cartModel.items}`);

	cartIcon.render({ count: cartModel.count });

	const cartItems: ICartItemData[] = cartModel.items.map((productId, index) => {
		const product = galleryModel.getProduct(productId);
		return {
			...product,
			cartIndex: index + 1,
		} as ICartItemData;
	});

	const cartData: ICartViewData = {
		items: cartItems,
		totalCost: cartModel.totalCost,
		isEmpty: cartModel.isEmpty,
	};

	cartView.render(cartData);

	console.log(`Корзина обновилась. selection: ${galleryModel.selection}`);
	if (galleryModel.selection !== null) {
		const itemData = {
			...galleryModel.getProduct(galleryModel.selection),
			inCart: cartModel.hasProduct(galleryModel.selection),
		} as IProductViewData;
		productDetailView.render(itemData);
	}
});

events.on(CartEvent.IconClicked, () => {
	console.log('Открываем корзину');
	if (modal.isOpened()) {
		console.warn('Модальное окно уже занято');
		return;
	}
	galleryModel.selection = null;

	const cartItems: ICartItemData[] = cartModel.items.map((productId, index) => {
		const product = galleryModel.getProduct(productId);
		return {
			...product,
			cartIndex: index + 1,
		} as ICartItemData;
	});

	const cartData: ICartViewData = {
		items: cartItems,
		totalCost: cartModel.totalCost,
		isEmpty: cartModel.isEmpty,
	};

	modal.render({ content: cartView.render(cartData) });
	modal.open();
});

events.on(CartEvent.CheckoutClicked, () => {
	console.log('Переходим к оформлению заказа');

	// Подготавливаем данные заказа из корзины
	orderModel.setOrderData(OrderStep.Cart, {
		items: cartModel.items,
		total: cartModel.totalCost,
	});
	// Переходим к оформлению
	orderModel.submitStep();
});

events.on(
	CartEvent.ItemDeleteClicked,
	(item: { id: TypeFrom<IProduct, 'id'> }) => {
		console.log(`Удаляем товар из корзины: ${item.id}`);
		cartModel.removeProduct(item.id);
	}
);

// Обработчики событий OrderModel
events.on(OrderEvent.StepChanged, (data: { step: OrderStep }) => {
	console.log(`Шаг заказа изменился на ${data.step}`);
	switch (data.step) {
		case OrderStep.Delivery:
			{
				// Отображаем форму доставки
				const orderDelivery = pick(orderModel.orderData, 'payment', 'address');
				const deliveryData = {
					...orderDelivery,
					validity: orderModel.validate(orderDelivery, false),
				};
				modal.render({ content: orderDeliveryView.render(deliveryData) });
			}
			break;

		case OrderStep.Contacts:
			{
				// Отображаем форму контактов
				const orderContacts = pick(orderModel.orderData, 'email', 'phone');
				const contactsData = {
					...orderContacts,
					validity: orderModel.validate(orderContacts, false),
				};
				modal.render({ content: orderContactsView.render(contactsData) });
			}
			break;

		case OrderStep.Success:
			// TODO: отобразить OrderSuccessView
			console.log('Заказ успешно оформлен!');
			// Очищаем корзину после успешного заказа
			cartModel.clear();
			break;

		case OrderStep.Cart:
			// Сброс состояния, возврат к корзине
			orderDeliveryView.reset();
			orderContactsView.reset();
			break;
	}
});

// Обработчик реактивной валидации полей
events.on(
	OrderEvent.ValidateRequest,
	(req: { step: OrderStep; data: Partial<IOrderRequest> }) => {
		const validity = orderModel.validate(req.data);
		if (req.step === OrderStep.Delivery) {
			orderDeliveryView.render({ validity });
		} else if (req.step === OrderStep.Contacts) {
			orderContactsView.render({ validity });
		}
	}
);

// Обработчик финальной валидации и смены шага
events.on(
	OrderEvent.SubmitStep,
	(data: { step: OrderStep; data: Partial<IOrderRequest> }) => {
		console.log('Финальная валидация шага:', data);
		orderModel.setOrderData(data.step, data.data);
		orderModel.submitStep();
	}
);

events.on(OrderEvent.SubmitOrderTransaction, () => {
	console.log('Отправляем заказ:', orderModel.orderData);

	// Отправляем заказ через API
	larekApi
		.sendOrder(orderModel.orderData)
		.then((response) => {
			console.log('Заказ успешно оформлен:', response);
			orderModel.orderResponse = response;
		})
		.catch((error) => {
			console.error('Ошибка оформления заказа:', error);
			orderModel.orderResponse = { error };
		});
});

// Обработчик события валидации данных заказа
events.on(OrderEvent.ValidationFailed, (validity: FieldValidity[]) => {
	console.log('Валидация не прошла:', validity);

	if (orderModel.currentStep === OrderStep.Delivery) {
		orderDeliveryView.render({
			validity,
		});
	} else if (orderModel.currentStep === OrderStep.Contacts) {
		orderContactsView.render({
			validity,
		});
	}
});

// Обработчик изменения данных заказа
events.on(OrderEvent.DataChanged, () => {
	switch (orderModel.currentStep) {
		case OrderStep.Delivery:
			{
				const orderDelivery = pick(orderModel.orderData, 'payment', 'address');
				orderDeliveryView.render({
					...orderDelivery,
					validity: orderModel.validate(orderDelivery),
				});
			}
			break;

		case OrderStep.Contacts:
			{
				const orderDelivery = pick(orderModel.orderData, 'email', 'phone');
				orderContactsView.render({
					...orderDelivery,
					validity: orderModel.validate(orderDelivery),
				});
			}
			break;
	}
});

// Обработчик ответа от сервера
events.on(OrderEvent.OrderFailed, () => {
	console.log('Заказ провалился:', );
	const orderError = orderModel.orderResponse as TOrderError;
	orderContactsView.render({validity: [{
		field: 'order',
		state: ValidityState.Invalid,
		error: orderError.error
	}]})
});

events.on(ModalEvent.Closed, () => {
	galleryModel.selection = null;

	// Если закрываем модальное окно во время оформления заказа, сбрасываем его состояние
	if (orderModel.currentStep !== OrderStep.Cart) {
		orderModel.reset();
	}
});

events.on(GalleryEvent.SelectionChanged, () => {
	console.log(`Изменился выбранный товар на ${galleryModel.selection}`);
	if (galleryModel.selection === null) return;
	const itemData = {
		...galleryModel.getProduct(galleryModel.selection),
		inCart: cartModel.hasProduct(galleryModel.selection),
	};
	modal.render({ content: productDetailView.render(itemData) });
	modal.open();
});

events.on(GalleryEvent.ItemsChanged, () => {
	console.log(`Список товаров обновился. Обновим галерею...`);
	productGalleryView.render(galleryModel.items);
});

larekApi
	.getProducts()
	.then((products) => {
		galleryModel.items = products;
	})
	.catch((error) => {
		console.error('Ошибка загрузки товаров:', error);
	});
