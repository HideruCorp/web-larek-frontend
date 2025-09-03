import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { LarekApi } from './components/LarekApi';
import { ProductViewFactory } from './components/product/ProductViewFactory';
import { ProductGalleryView } from './components/product/ProductGalleryView';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement, TypeFrom, cloneTemplate } from './utils/utils';
import { ProductGalleryModel } from './components/product/ProductGalleryModel';
import {
	IProduct,
	IProductViewData,
} from './types';

const galleryContainer = ensureElement<HTMLElement>('.gallery');

const events = new EventEmitter();

const api = new Api(API_URL);
const larekApi = new LarekApi(api, { cdnUrl: CDN_URL });

const itemCardFactory = new ProductViewFactory('#card-catalog', events);

const galleryView = new ProductGalleryView(galleryContainer, events, {
	itemFactory: itemCardFactory,
});

const galleryModel = new ProductGalleryModel(events);

events.on('product:select', (item: { id: TypeFrom<IProduct, 'id'> }) => {
	console.log(`Получили клик по элементу с id: ${item.id}`);
	galleryModel.selection = item.id;
});

events.on('product:action_called', (item: { id: TypeFrom<IProduct, 'id'> }) => {
	console.log(`Кликнули по кнопке в превью: ${item.id}`);
});

events.on('gallery:selection_changed', () => {
	console.log(`Изменился выбранный товар на ${galleryModel.selection}`);
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
