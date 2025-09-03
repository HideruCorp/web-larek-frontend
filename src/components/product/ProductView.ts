import { IProductViewData, ProductViewConfig } from '../../types';
import { DEFAULT_ITEM_VIEW_CONFIG } from '../../utils/constants';
import { ensureElement, formatPrice } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

/**
 * Компонент карточки товара для галереи каталога
 *
 * Назначение: отображение товара в виде карточки в галерее на главной странице
 */
export class ProductView extends Component<IProductViewData> {
	// DOM элементы карточки
	protected _categoryElement: HTMLElement;
	protected _titleElement: HTMLElement;
	protected _descriptionElement: HTMLElement | null;
	protected _imageElement: HTMLImageElement;
	protected _priceElement: HTMLElement;
	protected _addToCartButton: HTMLButtonElement | null;

	// Итоговая конфигурация компонента
	protected _config: ProductViewConfig;

	// Хранимые данные (только для событий)
	protected _productId: string;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<ProductViewConfig>
	) {
		super(container, events);

		// Объединяем дефолтную конфигурацию с переданной
		this._config = { ...DEFAULT_ITEM_VIEW_CONFIG, ...config };
		const domSelectors = this._config.domSelectors;

		// Находим все обязательные DOM элементы
		this._categoryElement = ensureElement(
			domSelectors.categorySelector,
			container
		);
		this._titleElement = ensureElement(domSelectors.titleSelector, container);
		this._imageElement = ensureElement(
			domSelectors.imageSelector,
			container
		) as HTMLImageElement;
		this._priceElement = ensureElement(domSelectors.priceSelector, container);

		// Необязательные DOM элементы
		this._descriptionElement = container.querySelector(
			domSelectors.descriptionSelector
		);
		this._addToCartButton = container.querySelector(
			domSelectors.actionButtonSelector
		) as HTMLButtonElement;

		if (this._config.itemSelectable) {
			this.container.addEventListener('click', () => {
				if (this._productId) {
					this.events?.emit('product:select', { id: this._productId });
				}
			});
		}

		if (this._addToCartButton) {
			this._addToCartButton.addEventListener('click', (evt) => {
				evt.stopPropagation();
				if (this._productId) {
					this.events?.emit('product:action_called', {
						id: this._productId,
					});
				}
			});
		}
	}

	/**
	 * Сеттер для ID товара
	 * Сохраняет ID для использования в событиях
	 */
	protected set id(value: string) {
		this._productId = value;
	}

	protected get id(): string {
		return this._productId;
	}

	/**
	 * Сеттер для названия товара
	 * Обновляет только текстовое содержимое заголовка
	 */
	protected set title(value: string) {
		this.setText(this._titleElement, value);
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

		Object.values(this._config.categoryClassMap).forEach((className) => {
			this.toggleClass(this._categoryElement, className, false);
		});

		const categoryClass = this._config.categoryClassMap[value];
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
	 * Сеттер для состояния корзины
	 * Обновляет текст и состояние кнопки действия
	 */
	protected set inCart(value: Pick<IProductViewData, 'inCart' | 'price'>) {
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

	/**
	 * Сеттер для цены товара
	 * Обрабатывает как числовые значения, так и null (бесценные товары)
	 */
	protected set price(value: number | null) {
		if (value === null) {
			this.setText(this._priceElement, 'Бесценно');
		} else {
			this.setText(this._priceElement, `${formatPrice(value)} синапсов`);
		}
	}

	/**
	 * Рендер компонента с данными товара
	 * Явно вызывает защищенные сеттеры для безопасности типов
	 *
	 * @param data - Частичные данные товара для обновления
	 * @returns DOM элемент карточки
	 */
	render(data?: Partial<IProductViewData>): HTMLElement {
		if (data) {
			if (data.id !== undefined) this.id = data.id;
			if (data.title !== undefined) this.title = data.title;
			if (data.description !== undefined) this.description = data.description;
			if (data.category !== undefined) this.category = data.category;
			if (data.image !== undefined) this.image = data.image;
			if (data.price !== undefined) this.price = data.price;
			if (data.inCart !== undefined)
				this.inCart = { inCart: data.inCart, price: data.price };
		}
		return this.container;
	}
}
