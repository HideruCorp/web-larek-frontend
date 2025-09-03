import { IProduct, ProductGalleryViewConfig } from "../../types";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

export class ProductGalleryView extends Component<IProduct[]> {
  protected _config: ProductGalleryViewConfig;
  
  constructor(container: HTMLElement, events: IEvents, config: ProductGalleryViewConfig) {
    super(container, events);
    this._config = config;

    if (!config.itemFactory) {
      throw new Error('ProductGalleryView: _config.itemFactory not set. Provide correct itemFactory in configuration');
    }
  }

  protected set items(products: IProduct[]) {
    this.container.replaceChildren(...products.map(item => {
      const itemView = this._config.itemFactory.build();
      return itemView.render(item);
  }));
  }

  render(data?: Partial<IProduct[]>): HTMLElement {
    this.items = data ?? [];
    return this.container;
  }

}
