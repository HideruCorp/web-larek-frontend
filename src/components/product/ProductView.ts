import { IProductViewData, ProductEvent, ProductViewConfig } from '../../types';
import { DEFAULT_ITEM_VIEW_CONFIG } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { BaseProductView } from './BaseProductView';
import { IEvents } from '../base/events';

/**
 * Компонент карточки товара для галереи каталога
 *
 * Назначение: отображение товара в виде карточки в галерее на главной странице
 */
export class ProductView extends BaseProductView<IProductViewData> {
	protected _categoryElement: HTMLElement;
	protected _descriptionElement: HTMLElement | null;
	protected _imageElement: HTMLImageElement;
	protected _addToCartButton: HTMLButtonElement | null;

	// Маппинг категорий
	protected _categoryClassMap: Record<string,string>;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<ProductViewConfig>
	) {
		super(container, events);

		const _config = { ...DEFAULT_ITEM_VIEW_CONFIG, ...config };
		this._categoryClassMap = _config.categoryClassMap;
		const domSelectors = _config.domSelectors;

		// Обязательные элементы
		this._categoryElement = ensureElement(
			domSelectors.categorySelector,
			container
		);
		this._imageElement = ensureElement(
			domSelectors.imageSelector,
			container
		) as HTMLImageElement;

		// Необязательные элементы
		this._descriptionElement = container.querySelector(
			domSelectors.descriptionSelector
		);
		this._addToCartButton = container.querySelector(
			domSelectors.actionButtonSelector
		) as HTMLButtonElement;

		// Обработчики событий
		if (_config.itemSelectable) {
			this.container.addEventListener('click', () => {
				if (this._productId) {
					this.events?.emit(ProductEvent.CardClicked, { id: this._productId });
				}
			});
		}

		if (this._addToCartButton) {
			this._addToCartButton.addEventListener('click', (evt) => {
				evt.stopPropagation();
				if (this._productId) {
					this.events?.emit(ProductEvent.ActionCalled, {
						id: this._productId,
					});
				}
			});
		}

		// Регистрация полей - простые поля (1:1)
		this.addRenderField('description');
		this.addRenderField('category');
		this.addRenderField('image');
		
		// Составное поле для кнопки (1:N) - зависит от inCart и price
		this.addRenderField('buttonState', ['inCart', 'price']);
	}



	/**
	 * Сеттер для описания товара
	 * Обновляет только текстовое содержимое заголовка
	 */
	protected set description(value: string) {
		if (!this._descriptionElement) return;
		this.setText(this._descriptionElement, value);
	}

	/**
	 * Сеттер для категории товара
	 * Обновляет текст и CSS класс категории согласно маппингу из конфигурации
	 */
	protected set category(value: string) {
		this.setText(this._categoryElement, value);

		Object.values(this._categoryClassMap).forEach((className) => {
			this.toggleClass(this._categoryElement, className, false);
		});

		const categoryClass = this._categoryClassMap[value];
		if (categoryClass) {
			this.toggleClass(this._categoryElement, categoryClass, true);
		}
	}

	/**
	 * Сеттер для изображения товара
	 * Согласно анализу API: API возвращает пути вида "/5_Dots.svg",
	 * полный URL формируется как CDN_URL + product.image при получении данных в самом Api
	 */
	protected set image(value: string) {
		this.setImage(
			this._imageElement,
			value,
			this._titleElement.textContent || 'Изображение товара'
		);
	}

	/**
	 * Сеттер для состояния кнопки
	 * Обновляет текст и состояние кнопки действия
	 * Автоматически получает объект с полями inCart и price
	 */
	protected set buttonState(value: Pick<IProductViewData, 'inCart' | 'price'>) {
		if (this._addToCartButton) {
			if (value.price === null) {
				this.setText(this._addToCartButton, 'Недоступно');
				this.setDisabled(this._addToCartButton, true);
			} else {
				this.setText(
					this._addToCartButton,
					value.inCart ? 'Удалить из корзины' : 'В корзину'
				);
				this.setDisabled(this._addToCartButton, false);
			}
		}
	}


}
