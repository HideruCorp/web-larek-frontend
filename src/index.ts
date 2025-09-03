import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { ProductGalleryModel } from './components/product/ProductGalleryModel';
import {
	IProduct,
} from './types';

const events = new EventEmitter();

const api = new Api(API_URL);
const larekApi = new LarekApi(api, { cdnUrl: CDN_URL });

const galleryModel = new ProductGalleryModel(events);

events.on('gallery:selection_changed', () => {
	console.log(`Изменился выбранный товар на ${galleryModel.selection}`);
});

events.on('gallery:items_updated', () => {
	console.log(`Список товаров обновился. Обновим галерею...`);
});

larekApi
	.getProducts()
	.then((products) => {
		galleryModel.items = products;
	})
	.catch((error) => {
		console.error('Ошибка загрузки товаров:', error);
	});
