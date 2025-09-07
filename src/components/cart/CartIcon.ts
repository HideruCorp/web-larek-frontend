import { TCartInfo, CartIconConfig, CartEvent } from '../../types';
import { ensureElement } from '../../utils/utils';
import { DEFAULT_CART_ICON_CONFIG } from '../../utils/constants';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

/**
 * Компонент иконки корзины в шапке сайта
 *
 * Назначение: отображение счетчика товаров в корзине и обработка клика для открытия корзины
 */
export class CartIcon extends Component<TCartInfo> {
	protected _counterElement: HTMLElement;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<CartIconConfig>
	) {
		super(container, events);

		const _config = { ...DEFAULT_CART_ICON_CONFIG, ...config };

		// Обязательные элементы
		this._counterElement = ensureElement(_config.counterSelector, container);

		// Обработчики событий
		this.container.addEventListener('click', () => {
			this.events?.emit(CartEvent.IconClicked);
		});

		this.addRenderField('count');
	}

	/**
	 * Сеттер для количества товаров в корзине
	 * Обновляет только текстовое содержимое счетчика
	 *
	 * @param value - количество товаров в корзине
	 */
	protected set count(value: number) {
		this.setText(this._counterElement, value.toString());
	}
}
