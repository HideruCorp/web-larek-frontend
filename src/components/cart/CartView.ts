import { ICartViewData, CartViewConfig, ICartItemData, CartEvent } from '../../types';
import { createElement, ensureElement, formatPrice } from '../../utils/utils';
import { DEFAULT_CART_VIEW_CONFIG } from '../../utils/constants';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

/**
 * Компонент корзины для отображения списка товаров в корзине
 * 
 * Назначение: отображение содержимого корзины с товарами, общей стоимостью и кнопкой оформления
 */
export class CartView extends Component<ICartViewData> {
	// DOM элементы корзины
	protected _listContainer: HTMLElement;
	protected _totalElement: HTMLElement;
	protected _checkoutButton: HTMLButtonElement;

	// Конфигурация компонента (сохраняется для itemFactory)
	protected _config: CartViewConfig;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<CartViewConfig>
	) {
		super(container, events);
		this._config = { ...DEFAULT_CART_VIEW_CONFIG, ...config } as CartViewConfig;

		if (!this._config.itemFactory) {
			throw new Error('CartView: config.itemFactory not set. Provide correct itemFactory in configuration');
		}

		// Находим все обязательные DOM элементы
		this._listContainer = ensureElement(this._config.listSelector, container);
		this._totalElement = ensureElement(this._config.totalSelector, container);
		this._checkoutButton = ensureElement(this._config.checkoutSelector, container) as HTMLButtonElement;

		// Обработчик клика по кнопке оформления
		this._checkoutButton.addEventListener('click', () => {
			this.events?.emit(CartEvent.CheckoutClicked);
		});
	}

	/**
	 * Сеттер для массива товаров в корзине
	 * Создает CartItemView для каждого товара с помощью фабрики
	 */
	protected set items(cartItems: ICartItemData[]) {
    if(cartItems.length === 0) {
      this._listContainer.replaceChildren(this._config.itemFactory.buildPlaceholder());
    } else {
      this._listContainer.replaceChildren(...cartItems.map(item => {
			const itemView = this._config.itemFactory.build();
			return itemView.render(item);
		}));
    }
		
	}

	/**
	 * Сеттер для общей стоимости корзины
	 * Обновляет отображение общей суммы
	 */
	protected set totalCost(value: number) {
		this.setText(this._totalElement, `${formatPrice(value)} синапсов`);
	}

	/**
	 * Сеттер для состояния пустой корзины
	 * Управляет активностью кнопки оформления
	 */
	protected set isEmpty(value: boolean) {
		this.setDisabled(this._checkoutButton, value);
	}

	/**
	 * Рендер компонента с данными корзины
	 * Явно вызывает защищенные сеттеры для безопасности типов
	 *
	 * @param data - Частичные данные корзины для обновления
	 * @returns DOM элемент корзины
	 */
	render(data?: Partial<ICartViewData>): HTMLElement {
		if (data) {
			if (data.items !== undefined) this.items = data.items;
			if (data.totalCost !== undefined) this.totalCost = data.totalCost;
			if (data.isEmpty !== undefined) this.isEmpty = data.isEmpty;
		}
		return this.container;
	}
}
