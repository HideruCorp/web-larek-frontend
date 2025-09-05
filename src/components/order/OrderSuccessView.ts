import { TOrderSuccess, OrderSuccessViewConfig, OrderEvent } from '../../types';
import { ensureElement } from '../../utils/utils';
import { DEFAULT_ORDER_SUCCESS_CONFIG } from '../../utils/constants';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

/**
 * Компонент успешного оформления заказа
 * 
 * Назначение: отображение суммы оформленного заказа и обработка клика для закрытия модального окна
 */
export class OrderSuccessView extends Component<TOrderSuccess> {
  protected _totalElement: HTMLElement;
  protected _closeButton: HTMLElement;

  constructor(container: HTMLElement, events?: IEvents, config?: Partial<OrderSuccessViewConfig>) {
    super(container, events);

    const _config = { ...DEFAULT_ORDER_SUCCESS_CONFIG, ...config };

    // Обязательные элементы
    this._totalElement = ensureElement(_config.totalSelector, container);
    this._closeButton = ensureElement(_config.closeButtonSelector, container);

    // Обработчики событий
    this._closeButton.addEventListener('click', () => {
      this.events?.emit(OrderEvent.SuccessClose);
    });
  }

  /**
   * Сеттер для суммы заказа
   * Обновляет текстовое содержимое элемента с суммой
   * 
   * @param value - сумма заказа
   */
  protected set total(value: number) {
    this.setText(this._totalElement, `Списано ${value} синансов`);
  }

  /**
   * Рендер компонента с данными успешного заказа
   * Явно вызывает защищенные сеттеры для безопасности типов
   *
   * @param data - Данные успешного заказа для обновления
   * @returns DOM элемент компонента
   */
  render(data?: Partial<TOrderSuccess>): HTMLElement {
    if (data?.total !== undefined) {
      this.total = data.total;
    }
    return this.container;
  }
}