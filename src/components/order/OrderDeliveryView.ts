import { DEFAULT_ORDER_DELIVERY_CONFIG } from '../../utils/constants';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { FormComponent } from '../base/FormComponent';
import { IEvents } from '../base/events';
import {
	OrderDeliveryViewConfig,
	OrderEvent,
	PaymentMethod,
	TOrderDelivery,
} from '../../types';

/**
 * Компонент для первого шага оформления заказа - выбор способа оплаты и адреса доставки.
 * Наследуется от базового Component и работает с типом TOrderDelivery.
 */
export class OrderDeliveryView extends FormComponent<TOrderDelivery> {
	protected _config: Pick<
		OrderDeliveryViewConfig,
		'paymentMethodMapping' | 'activeButtonModifier'
	>;
	protected _paymentButtons: HTMLButtonElement[];
	protected _addressInput: HTMLInputElement;

	constructor(
		container: HTMLElement,
		events: IEvents,
		config?: Partial<OrderDeliveryViewConfig>
	) {
		super(container, events, config);
		const _config = { ...DEFAULT_ORDER_DELIVERY_CONFIG, ...config };
		this._config = _config;

		// Обязательные элементы
		this._paymentButtons = ensureAllElements<HTMLButtonElement>(
			_config.paymentButtonSelector,
			this.container
		);
		this._addressInput = ensureElement<HTMLInputElement>(
			_config.addressInputSelector,
			this.container
		);

		// Обработчики событий
		this._setupEventListeners();
	}

	/**
	 * Настройка обработчиков событий
	 */
	protected _setupEventListeners(): void {
		// Обработка выбора способа оплаты
		this._paymentButtons.forEach((btn) => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();

				const paymentMethod = this._config.paymentMethodMapping.find(
					(el) => el.name === btn.getAttribute('name')
				)?.method;
				this.events.emit(OrderEvent.ChangeRequest, {
					changedData: { payment: paymentMethod },
				});
			});
		});

		// Реактивная валидация при вводе адреса
		this._addressInput.addEventListener('input', () => {
			this.events.emit(OrderEvent.ChangeRequest, {
				changedData: { address: this._addressInput.value },
			});
		});
	}

	/**
	 * Обработка отправки формы
	 */
	protected onSubmit(): void {
		this.events.emit(OrderEvent.SubmitStep);
	}

	/**
	 * Установка способа оплаты
	 */
	protected set payment(value: PaymentMethod) {
		this._paymentButtons.forEach((btn) => {
			const btnPaymentMethod = this._config.paymentMethodMapping.find(
				(el) => el.name === btn.getAttribute('name')
			)?.method;
			this.toggleClass(
				btn,
				this._config.activeButtonModifier,
				value === btnPaymentMethod
			);
		});
	}

	/**
	 * Установка адреса доставки
	 */
	protected set address(value: string) {
		this._addressInput.value = value;
	}

	/**
	 * Основной метод рендеринга формы
	 */
	protected renderForm(data: Partial<TOrderDelivery>): HTMLElement {
		if (data.payment !== undefined) {
			this.payment = data.payment;
		}
		if (data.address !== undefined) {
			this.address = data.address;
		}
		return this.container;
	}
}
