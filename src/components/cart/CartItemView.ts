import { ICartItemData, CartItemViewConfig, CartEvent } from '../../types';
import { ensureElement, formatPrice } from '../../utils/utils';
import { DEFAULT_CART_ITEM_CONFIG } from '../../utils/constants';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

/**
 * Компонент элемента корзины для отображения товара в списке корзины
 * 
 * Назначение: отображение товара в корзине с индексом позиции и кнопкой удаления
 */
export class CartItemView extends Component<ICartItemData> {
	protected _indexElement: HTMLElement;
	protected _titleElement: HTMLElement;
	protected _priceElement: HTMLElement;
	protected _removeButton: HTMLButtonElement;

	// Хранимые данные (только ID для событий)
	protected _productId: string;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<CartItemViewConfig>
	) {
		super(container, events);

		const finalConfig = { ...DEFAULT_CART_ITEM_CONFIG, ...config };

		// Обязательные элементы
		this._indexElement = ensureElement(finalConfig.indexSelector, container);
		this._titleElement = ensureElement(finalConfig.titleSelector, container);
		this._priceElement = ensureElement(finalConfig.priceSelector, container);
		this._removeButton = ensureElement(finalConfig.removeButtonSelector, container) as HTMLButtonElement;

		// Обработчики событий
		this._removeButton.addEventListener('click', () => {
			if (this._productId) {
				this.events?.emit(CartEvent.ItemDeleteClicked, { id: this._productId });
			}
		});
	}

	/**
	 * Сеттер для ID товара
	 * Сохраняет ID для использования в событиях
	 */
	protected set id(value: string) {
		this._productId = value;
	}

	/**
	 * Сеттер для индекса товара в корзине
	 * Отображает позицию товара в списке (1, 2, 3...)
	 */
	protected set cartIndex(value: number) {
		this.setText(this._indexElement, value.toString());
	}

	/**
	 * Сеттер для названия товара
	 * Обновляет только текстовое содержимое заголовка
	 */
	protected set title(value: string) {
		this.setText(this._titleElement, value);
	}

	/**
	 * Сеттер для цены товара
	 * Обрабатывает как числовые значения, так и null (бесценные товары)
	 * Бесценные товары не должны попадать в корзину, но добавлена защита
	 */
	protected set price(value: number | null) {
		if (value === null) {
			this.setText(this._priceElement, 'Бесценно');
		} else {
			this.setText(this._priceElement, `${formatPrice(value)} синапсов`);
		}
	}

	/**
	 * Рендер компонента с данными товара в корзине
	 * Явно вызывает защищенные сеттеры для безопасности типов
	 *
	 * @param data - Частичные данные товара в корзине для обновления
	 * @returns DOM элемент карточки товара в корзине
	 */
	render(data?: Partial<ICartItemData>): HTMLElement {
		if (data) {
			if (data.id !== undefined) this.id = data.id;
			if (data.cartIndex !== undefined) this.cartIndex = data.cartIndex;
			if (data.title !== undefined) this.title = data.title;
			if (data.price !== undefined) this.price = data.price;
		}
		return this.container;
	}
}
