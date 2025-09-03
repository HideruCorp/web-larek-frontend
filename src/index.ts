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
} from './types';
import { CartModel } from './components/cart/CartModel';

const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalElement = ensureElement<HTMLElement>('#modal-container');

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

events.on('product:select', (item: { id: TypeFrom<IProduct, 'id'> }) => {
	console.log(`Получили клик по элементу с id: ${item.id}`);
	if (modal.isOpened()) {
		console.warn(
			'При открытом модальном окне элементы галлереи не кликабельны'
		);
		return;
	}
	galleryModel.selection = item.id;
});

events.on('product:action_called', (item: { id: TypeFrom<IProduct, 'id'> }) => {
	console.log(`Кликнули по кнопке в превью: ${item.id}`);
	if (!cartModel.hasProduct(item.id)) {
		const cartItem: TCartItem = galleryModel.getProduct(item.id);
		cartModel.addProduct(cartItem);
	} else {
		cartModel.removeProduct(item.id);
	}
});

events.on('cart:changed', () => {
	console.log(`Изменился список в корзине: ${cartModel.items}`);

	// TODO: Обновить иконку корзины

	// TODO: Обновить вью корзины

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

events.on('modal:close', () => {
	galleryModel.selection = null;
});

events.on('gallery:selection_changed', () => {
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

events.on('gallery:items_updated', () => {
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
