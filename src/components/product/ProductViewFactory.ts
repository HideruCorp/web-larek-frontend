import { IComponent, IComponentFactory, IProductViewData, ProductViewConfig } from '../../types';
import { cloneTemplate } from '../../utils/utils';
import { ProductView } from './ProductView';
import { IEvents } from '../base/events';

export class ProductViewFactory implements IComponentFactory<IProductViewData> {
  constructor(
    protected templateSelector: string | HTMLTemplateElement,
    protected events?: IEvents,
    protected config?: Partial<ProductViewConfig>
  ) {}
  
  build(): IComponent<IProductViewData> {
    const container = cloneTemplate<HTMLElement>(this.templateSelector);
    return new ProductView(container, this.events, this.config);
  }
}
