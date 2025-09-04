import {
	IComponent,
	IComponentFactory,
	ICartItemData,
  CartItemFactoryConfig
} from '../../types';
import { cloneTemplate, createElement } from '../../utils/utils';
import { CartItemView } from './CartItemView';
import { IEvents } from '../base/events';
import { DEFAULT_CART_ITEM_FACTORY_CONFIG } from '../../utils/constants';

export class CartItemFactory implements IComponentFactory<ICartItemData> {
  protected _config: CartItemFactoryConfig;

	constructor(
		protected templateSelector: string | HTMLTemplateElement,
		protected events: IEvents,
		config?: Partial<CartItemFactoryConfig>
	) {
    this._config = { ...DEFAULT_CART_ITEM_FACTORY_CONFIG, ...config };
  }
	buildPlaceholder(): HTMLElement {
		return createElement<HTMLSpanElement>(this._config.placeholder.elementName, {
			classList: this._config.placeholder.classList,
			textContent: this._config.placeholder.text,
		});
	}

	build(): IComponent<ICartItemData> {
		const container = cloneTemplate<HTMLElement>(this.templateSelector);
		return new CartItemView(container, this.events, this._config.itemConfig);
	}
}
