import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { LarekApi } from './components/LarekApi';
import { ProductViewFactory } from './components/product/ProductViewFactory';
import { ProductGalleryView } from './components/product/ProductGalleryView';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement, TypeFrom, cloneTemplate } from './utils/utils';
import { Modal } from './components/common/Modal';
import { ProductGalleryModel } from './components/product/ProductGalleryModel';
import {
	IProduct,
	IProductViewData,
	TCartItem,
	ICartItemData,
	ICartViewData,
	TOrderItems,
	ProductEvent,
	GalleryEvent,
	ModalEvent,
	CartEvent,
} from './types';
import { CartModel } from './components/cart/CartModel';
import { CartView } from './components/cart/CartView';
import { CartIcon } from './components/cart/CartIcon';
import { CartItemFactory } from './components/cart/CartItemFactory';

const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalElement = ensureElement<HTMLElement>('#modal-container');
const cartIconElement = ensureElement<HTMLElement>('.header__basket');

const events = new EventEmitter();

const api = new Api(API_URL);
const larekApi = new LarekApi(api, { cdnUrl: CDN_URL });

const itemCardFactory = new ProductViewFactory('#card-catalog', events);
const itemDetailFactory = new ProductViewFactory('#card-preview', events, {
	itemSelectable: false,
});

const galleryView = new ProductGalleryView(galleryContainer, events, {
	itemFactory: itemCardFactory,
});

const modal = new Modal(modalElement, events);

const galleryModel = new ProductGalleryModel(events);
const cartModel = new CartModel(events);

const cartIcon = new CartIcon(cartIconElement, events);

const cartItemFactory = new CartItemFactory('#card-basket', events);
const cartContainer = cloneTemplate<HTMLElement>('#basket');
const cartView = new CartView(cartContainer, events, {
	itemFactory: cartItemFactory,
});

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
		const itemDetailView = itemDetailFactory.build();
		modal.render({ content: itemDetailView.render(itemData) });
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
	const orderData: TOrderItems = {
		items: cartModel.items,
		total: cartModel.totalCost,
	};
});

events.on(
	CartEvent.ItemDeleteClicked,
	(item: { id: TypeFrom<IProduct, 'id'> }) => {
		console.log(`Удаляем товар из корзины: ${item.id}`);
		cartModel.removeProduct(item.id);
	}
);

events.on(ModalEvent.Closed, () => {
	galleryModel.selection = null;
});

events.on(GalleryEvent.SelectionChanged, () => {
	console.log(`Изменился выбранный товар на ${galleryModel.selection}`);
	if (galleryModel.selection === null) return;
	const itemData = {
		...galleryModel.getProduct(galleryModel.selection),
		inCart: cartModel.hasProduct(galleryModel.selection),
	} as IProductViewData;
	const itemDetailView = itemDetailFactory.build();
	modal.render({ content: itemDetailView.render(itemData) });
	modal.open();
});

events.on(GalleryEvent.ItemsChanged, () => {
	console.log(`Список товаров обновился. Обновим галерею...`);
	galleryView.render(galleryModel.items);
});

larekApi
	.getProducts()
	.then((products) => {
		galleryModel.items = products;
	})
	.catch((error) => {
		console.error('Ошибка загрузки товаров:', error);
	});
