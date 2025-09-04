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
  
  protected _config: CartIconConfig;

  constructor(container: HTMLElement, events?: IEvents, config?: Partial<CartIconConfig>) {
    super(container, events);

    this._config = { ...DEFAULT_CART_ICON_CONFIG, ...config };

    // Обязательные элементы
    this._counterElement = ensureElement(this._config.counterSelector, container);

    // Обработчики событий
    this.container.addEventListener('click', () => {
      this.events?.emit(CartEvent.IconClicked);
    });
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

  /**
   * Рендер компонента с данными корзины
   * Явно вызывает защищенные сеттеры для безопасности типов
   *
   * @param data - Данные корзины для обновления
   * @returns DOM элемент кнопки корзины
   */
  render(data?: Partial<TCartInfo>): HTMLElement {
    if (data?.count !== undefined) {
      this.count = data.count;
    }
    return this.container;
  }
}
