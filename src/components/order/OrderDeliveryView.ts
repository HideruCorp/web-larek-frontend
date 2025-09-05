import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import {
	TOrderDelivery,
	FormData,
	PaymentMethod,
	OrderEvent,
	OrderStep,
	OrderDeliveryViewConfig,
	FieldValidity,
	ValidityState,
} from '../../types';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { DEFAULT_ORDER_DELIVERY_CONFIG } from '../../utils/constants';

/**
 * Компонент для первого шага оформления заказа - выбор способа оплаты и адреса доставки.
 * Наследуется от базового Component и работает с типом TOrderDelivery.
 */
export class OrderDeliveryView extends Component<FormData<TOrderDelivery>> {
	protected _config: Pick<OrderDeliveryViewConfig, 'paymentMethodMapping' | 'activeButtonModifier'>;
	protected _formElement: HTMLFormElement;
	protected _paymentButtons: HTMLButtonElement[];
	protected _addressInput: HTMLInputElement;
	protected _submitButton: HTMLButtonElement;
	protected _errorElement: HTMLElement;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<OrderDeliveryViewConfig>
	) {
		super(container, events);
		const _config = { ...DEFAULT_ORDER_DELIVERY_CONFIG, ...config };
		this._config = _config;

		// Обязательные элементы
		this._formElement = this.container as HTMLFormElement;
		this._paymentButtons = ensureAllElements<HTMLButtonElement>(
			_config.paymentButtonSelector,
			this.container
		);
		this._addressInput = ensureElement<HTMLInputElement>(
			_config.addressInputSelector,
			this.container
		);
		this._submitButton = ensureElement<HTMLButtonElement>(
			_config.submitButtonSelector,
			this.container
		);
		this._errorElement = ensureElement<HTMLElement>(
			_config.errorSelector,
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
				this.payment = paymentMethod;

				this._handleValidate();
			});
		});

		// Реактивная валидация при вводе адреса
		this._addressInput.addEventListener(
			'input',
			this._handleValidate.bind(this)
		);

		// Обработка кнопки "Далее"
		this._formElement.addEventListener('submit', (e) => {
			e.preventDefault();
			this._handleSubmit();
		});
	}

	protected _handleValidate(): void {
		this.validity = [];

		this.events?.emit(OrderEvent.ValidateRequest, {
			step: OrderStep.Delivery,
			data: this._getFormData(),
		});
	}

	protected _getFormData(): TOrderDelivery {
		const orderData: TOrderDelivery = {
			payment: this.payment,
			address: this.address,
		};
		return orderData;
	}

	/**
	 * Обработка отправки формы
	 */
	protected _handleSubmit(): void {
		this.validity = [];

		this.events?.emit(OrderEvent.SubmitStep, {
			step: OrderStep.Delivery,
			data: this._getFormData(),
		});
	}

	/**
	 * Получение способа оплаты
	 */
	protected get payment(): PaymentMethod {
		const activeButton = this._paymentButtons.find((btn) =>
			btn.classList.contains(this._config.activeButtonModifier)
		);
		if (!activeButton) return '';
		return (
			this._config.paymentMethodMapping.find(
				(el) => el.name === activeButton.getAttribute('name')
			)?.method || ''
		);
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
	 * Получение адреса доставки
	 */
	protected get address(): string {
		return this._addressInput.value;
	}

	/**
	 * Установка адреса доставки
	 */
	protected set address(value: string) {
		this._addressInput.value = value;
	}

	/**
	 * Отображение ошибок валидации
	 */
	protected set validity(validity: FieldValidity[]) {
		const invalid = validity.filter(
			(field) => field.state === ValidityState.Invalid
		);
		if (invalid.length > 0) {
			this.setText(this._errorElement, invalid.shift().error);
			this.setDisabled(this._submitButton, true);
		} else {
			const incomplete = validity.filter(
				(field) => field.state === ValidityState.Incomplete
			);
			const incompleteCount = incomplete.length;
			this.setText(
				this._errorElement,
				incompleteCount > 0 && incompleteCount !== validity.length
					? incomplete.shift().error
					: ''
			);
			this.setDisabled(this._submitButton, incompleteCount > 0);
		}
	}

	/**
	 * Основной метод рендеринга компонента
	 */
	render(data?: Partial<FormData<TOrderDelivery>>): HTMLElement {
		if (data) {
			if (data.payment !== undefined) {
				this.payment = data.payment;
			}
			if (data.address !== undefined) {
				this.address = data.address;
			}
			if (data.validity !== undefined) {
				this.validity = data.validity;
			}
		}
		return this.container;
	}
}
