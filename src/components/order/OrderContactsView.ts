import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import {
	TOrderContacts,
	FormData,
	OrderEvent,
	OrderStep,
	OrderContactsViewConfig,
	FieldValidity,
	ValidityState,
} from '../../types';
import { ensureElement } from '../../utils/utils';
import { DEFAULT_ORDER_CONTACTS_CONFIG } from '../../utils/constants';

/**
 * Компонент для второго шага оформления заказа - ввод контактных данных (email и телефон).
 * Наследуется от базового Component и работает с типом TOrderContacts.
 */
export class OrderContactsView extends Component<FormData<TOrderContacts>> {
	protected _config: OrderContactsViewConfig;
	protected _formElement: HTMLFormElement;
	protected _emailInput: HTMLInputElement;
	protected _phoneInput: HTMLInputElement;
	protected _submitButton: HTMLButtonElement;
	protected _errorElement: HTMLElement;

	constructor(
		container: HTMLElement,
		events?: IEvents,
		config?: Partial<OrderContactsViewConfig>
	) {
		super(container, events);
		this._config = { ...DEFAULT_ORDER_CONTACTS_CONFIG, ...config };

		// Инициализируем элементы формы
		this._formElement = this.container as HTMLFormElement;
		this._emailInput = ensureElement<HTMLInputElement>(
			this._config.emailInputSelector,
			this.container
		);
		this._phoneInput = ensureElement<HTMLInputElement>(
			this._config.phoneInputSelector,
			this.container
		);
		this._submitButton = ensureElement<HTMLButtonElement>(
			this._config.submitButtonSelector,
			this.container
		);
		this._errorElement = ensureElement<HTMLElement>(
			this._config.errorSelector,
			this.container
		);

		// Устанавливаем обработчики событий
		this._setupEventListeners();
	}

	/**
	 * Настройка обработчиков событий
	 */
	protected _setupEventListeners(): void {
		// Реактивная валидация при вводе email
		this._emailInput.addEventListener('input', this._handleValidate.bind(this));

		// Реактивная валидация при вводе телефона
		this._phoneInput.addEventListener('input', this._handleValidate.bind(this));

		// Обработка отправки формы
		this._formElement.addEventListener('submit', (e) => {
			e.preventDefault();
			this._handleSubmit();
		});
	}

	protected _handleValidate(): void {
		// Очищаем ошибки перед отправкой
		this.validity = [];

		// Отправляем событие для реактивной валидации
		this.events?.emit(OrderEvent.ValidateRequest, {
			step: OrderStep.Contacts,
			data: this._getFormData(),
		});
	}

	protected _getFormData(): TOrderContacts {
		const orderData: TOrderContacts = {
			email: this.email,
			phone: this.phone,
		};
		return orderData;
	}

	/**
	 * Обработка отправки формы
	 */
	protected _handleSubmit(): void {
		// Очищаем ошибки перед отправкой
		this.validity = [];

		// Генерируем событие для финальной валидации и смены шага
		this.events?.emit(OrderEvent.SubmitStep, {
			step: OrderStep.Contacts,
			data: this._getFormData(),
		});
	}

	/**
	 * Получение email
	 */
	protected get email(): string {
		return this._emailInput.value;
	}

	/**
	 * Установка email
	 */
	protected set email(value: string) {
		this._emailInput.value = value;
	}

	/**
	 * Получение телефона
	 */
	protected get phone(): string {
		return this._phoneInput.value;
	}

	/**
	 * Установка телефона
	 */
	protected set phone(value: string) {
		this._phoneInput.value = value;
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
	render(data?: Partial<FormData<TOrderContacts>>): HTMLElement {
		// Обновляем данные если они переданы
		if (data) {
			if (data.email !== undefined) {
				this.email = data.email;
			}
			if (data.phone !== undefined) {
				this.phone = data.phone;
			}
			if (data.validity !== undefined) {
				this.validity = data.validity;
			}
		}
		return this.container;
	}

	/**
	 * Метод для сброса формы
	 */
	reset(): void {
		this.email = '';
		this.phone = '';
		this.validity = [];
	}
}
