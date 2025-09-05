import './scss/styles.scss';

import { Api } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { AppPresenter } from './components/AppPresenter';
import { CartIcon } from './components/cart/CartIcon';
import { CartItemFactory } from './components/cart/CartItemFactory';
import { CartModel } from './components/cart/CartModel';
import { CartView } from './components/cart/CartView';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { IAppPresenterDependencies } from './types';
import { LarekApi } from './components/LarekApi';
import { Modal } from './components/common/Modal';
import { OrderContactsView } from './components/order/OrderContactsView';
import { OrderDeliveryView } from './components/order/OrderDeliveryView';
import { OrderModel } from './components/order/OrderModel';
import { OrderSuccessView } from './components/order/OrderSuccessView';
import { ProductGalleryModel as ProductModel } from './components/product/ProductModel';
import { ProductGalleryView } from './components/product/ProductGalleryView';
import { ProductView } from './components/product/ProductView';
import { ProductViewFactory } from './components/product/ProductViewFactory';

// DOM элементы и шаблоны
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const cartIconElement = ensureElement<HTMLElement>('.header__basket');
const modalElement = ensureElement<HTMLElement>('#modal-container');

const cartContainer = cloneTemplate<HTMLElement>('#basket');
const productDetailElement = cloneTemplate<HTMLElement>('#card-preview');
const orderDeliveryElement = cloneTemplate<HTMLElement>('#order');
const orderContactsElement = cloneTemplate<HTMLElement>('#contacts');
const successElement = cloneTemplate<HTMLElement>('#success');

// Api и EventEmitter
const events = new EventEmitter();
const larekApi = new LarekApi(new Api(API_URL), { cdnUrl: CDN_URL });

// Фабрики
const productCardFactory = new ProductViewFactory('#card-catalog', events);
const cartItemFactory = new CartItemFactory('#card-basket', events);

// Модели
const productModel = new ProductModel(events);
const cartModel = new CartModel(events);
const orderModel = new OrderModel(events);

// View компоненты
const modal = new Modal(modalElement, events);
const productDetailView = new ProductView(productDetailElement, events, {
	itemSelectable: false,
});
const productGalleryView = new ProductGalleryView(galleryContainer, events, {
	itemFactory: productCardFactory,
});

const cartIcon = new CartIcon(cartIconElement, events);
const cartView = new CartView(cartContainer, events, {
	itemFactory: cartItemFactory,
});

const orderDeliveryView = new OrderDeliveryView(orderDeliveryElement, events);
const orderContactsView = new OrderContactsView(orderContactsElement, events);
const orderSuccessView = new OrderSuccessView(successElement, events);

const dependencies: IAppPresenterDependencies = {
	events,
	larekApi,
	modal,
	product: {
		productModel,
		productGalleryView,
		productDetailView,
	},
	cart: {
		cartModel,
		cartIcon,
		cartView,
	},
	order: {
		orderModel,
		orderDeliveryView,
		orderContactsView,
		orderSuccessView,
	},
};

// Презентер
const presenter = new AppPresenter(dependencies);
presenter.loadInitialData();
