import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { formatPrice, ensureElement } from '../../utils/utils';
import { IBaseProductData, BaseProductViewConfig } from '../../types';
import { DEFAULT_BASE_PRODUCT_CONFIG } from '../../utils/constants';

export abstract class BaseProductView<T extends IBaseProductData> extends Component<T> {
	protected _titleElement: HTMLElement;
	protected _priceElement: HTMLElement;
	protected _productId: string;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<BaseProductViewConfig>
	) {
		super(container, events);

		const finalConfig = { ...DEFAULT_BASE_PRODUCT_CONFIG, ...config };
		this._titleElement = ensureElement(finalConfig.titleSelector, container);
		this._priceElement = ensureElement(finalConfig.priceSelector, container);

		// Поля представления
		this.addRenderField('id');
		this.addRenderField('title');
		this.addRenderField('price');
	}

	protected set id(value: string) {
		this._productId = value;
	}

	protected set title(value: string) {
		this.setText(this._titleElement, value);
	}

	protected set price(value: number | null) {
		if (value === null) {
			this.setText(this._priceElement, 'Бесценно');
		} else {
			this.setText(this._priceElement, `${formatPrice(value)} синапсов`);
		}
	}
}
