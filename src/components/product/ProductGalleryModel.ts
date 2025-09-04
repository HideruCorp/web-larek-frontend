import { GalleryEvent, IProduct, IProductGalleryModel } from "../../types";
import { TypeFrom } from "../../utils/utils";
import { IEvents } from "../base/events";


export interface ProductGalleryModelConstructor {
  new(events: IEvents): IProductGalleryModel;
}

export class ProductGalleryModel implements IProductGalleryModel {
  protected _items: IProduct[];
  protected _selection: TypeFrom<IProduct, "id"> | null;
  
  constructor(protected events: IEvents) {
    this._items = [];
  }

  public get selection(): TypeFrom<IProduct, "id"> | null {
    return this._selection;
  }
  public set selection(value: TypeFrom<IProduct, "id">  | null) {
    this._selection = value;
    this.events.emit(GalleryEvent.SelectionChanged, { id: value });
  }
  
  get items(): IProduct[] {
    return this._items;
  }

  set items(value: IProduct[]) {
    this._items = value;
    this.events.emit(GalleryEvent.ItemsChanged, { newId: value });
  }

  getProduct(productId: TypeFrom<IProduct, "id">): IProduct | null {
    return this._items.find(prod => prod.id === productId) ?? null;
  }
}
