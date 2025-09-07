import { ICartItemData, CartItemViewConfig, CartEvent } from '../../types';
import { ensureElement } from '../../utils/utils';
import { DEFAULT_CART_ITEM_CONFIG } from '../../utils/constants';
import { BaseProductView } from '../product/BaseProductView';
import { IEvents } from '../base/events';

/**
 * Компонент элемента корзины для отображения товара в списке корзины
 * 
 * Назначение: отображение товара в корзине с индексом позиции и кнопкой удаления
 */
export class CartItemView extends BaseProductView<ICartItemData> {
	protected _indexElement: HTMLElement;
	protected _removeButton: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<CartItemViewConfig>
	) {
		super(container, events);

		const finalConfig = { ...DEFAULT_CART_ITEM_CONFIG, ...config };

		// Обязательные элементы
		this._indexElement = ensureElement(finalConfig.indexSelector, container);
		this._removeButton = ensureElement(finalConfig.removeButtonSelector, container) as HTMLButtonElement;

		// Register cart-specific field
		this.addRenderField('cartIndex');

		// Обработчики событий
		this._removeButton.addEventListener('click', () => {
			if (this._productId) {
				this.events?.emit(CartEvent.ItemDeleteClicked, { id: this._productId });
			}
		});
	}


	/**
	 * Сеттер для индекса товара в корзине
	 * Отображает позицию товара в списке (1, 2, 3...)
	 */
	protected set cartIndex(value: number) {
		this.setText(this._indexElement, value.toString());
	}



}
