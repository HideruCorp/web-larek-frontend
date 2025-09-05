import { CartEvent, ICartModel, IProduct, TCartItem } from '../../types';
import { TypeFrom } from '../../utils/utils';
import { IEvents } from '../base/events';

/**
 * Модель корзины товаров
 * 
 * Отвечает за:
 * - Хранение списка товаров в корзине с их ценами
 * - Управление товарами в корзине (добавление, удаление, очистка)
 * - Автоматический расчет общей стоимости корзины
 * - Уведомление об изменениях через событие cart:changed
 */
export class CartModel implements ICartModel {
  protected _items: TCartItem[];
  
  constructor(protected events: IEvents) {
    this._items = [];
  }

  /**
   * Геттер для массива ID товаров в корзине
   * Возвращает только ID товаров, скрывая внутреннюю структуру с ценами
   */
  get items(): TypeFrom<IProduct, 'id'>[] {
    return this._items.map(item => item.id);
  }

  /**
   * Вычисляемое поле общей стоимости корзины
   * Автоматически рассчитывается из цен товаров в корзине
   */
  get totalCost(): number {
    return this._items.reduce((total, item) => {
      return total + item.price;
    }, 0);
  }

  get count(): number {
    return this._items.length;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Добавляет товар в корзину
   * Исключает товары с price: null (бесценные товары)
   * 
   * @param productData - Данные товара (ID и цена)
   */
  addProduct(productData: TCartItem): void {
    if (!this.hasProduct(productData.id) && productData.price !== null) {
      this._items.push({ ...productData });
      this.events.emit(CartEvent.ItemsChanged);
    }
  }

  /**
   * Удаляет товар из корзины
   * 
   * @param productId - Данные товара для удаления (достаточно ID)
   */
  removeProduct(productId: TypeFrom<IProduct, 'id'>): void {
    const productIndex = this._items.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
      this._items.splice(productIndex, 1);
      this.events.emit(CartEvent.ItemsChanged);
    }
  }

  /**
   * Проверяет наличие товара в корзине
   * 
   * @param productId - ID товара для проверки
   * @returns true если товар в корзине, false если нет
   */
  hasProduct(productId: TypeFrom<IProduct, 'id'>): boolean {
    return this._items.some(item => item.id === productId);
  }

  /**
   * Очищает корзину от всех товаров
   * Используется после успешного оформления заказа
   */
  clear(): void {
    if (!this.isEmpty) {
      this._items = [];
      this.events.emit(CartEvent.ItemsChanged);
    }
  }
}
