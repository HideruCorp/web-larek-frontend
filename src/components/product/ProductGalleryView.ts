import {
	IComponentFactory,
	IGalleryViewData,
	IProduct,
	ProductGalleryViewConfig,
} from '../../types';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class ProductGalleryView extends Component<IGalleryViewData> {
	protected _itemFactory: IComponentFactory<IProduct>;

	constructor(container: HTMLElement, events: IEvents, config: ProductGalleryViewConfig) {
		super(container, events);
		this._itemFactory = config.itemFactory;

		if (!this._itemFactory) {
			throw new Error(
				'ProductGalleryView: itemFactory not set. Provide correct itemFactory in configuration'
			);
		}

		this.addRenderField('items');
	}

	protected set items(products: IProduct[]) {
		this.container.replaceChildren(
			...products.map((item) => {
				const itemView = this._itemFactory.build();
				return itemView.render(item);
			})
		);
	}
}
