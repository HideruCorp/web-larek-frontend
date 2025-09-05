import { DEFAULT_ORDER_CONTACTS_CONFIG } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { FormComponent } from '../base/FormComponent';
import { IEvents } from '../base/events';
import {
	OrderContactsViewConfig,
	OrderEvent,
	TOrderContacts,
} from '../../types';

/**
 * Компонент для второго шага оформления заказа - ввод контактных данных (email и телефон).
 * Наследуется от базового Component и работает с типом TOrderContacts.
 */
export class OrderContactsView extends FormComponent<TOrderContacts> {
	protected _emailInput: HTMLInputElement;
	protected _phoneInput: HTMLInputElement;

	constructor(
		container: HTMLElement,
		events: IEvents,
		config?: Partial<OrderContactsViewConfig>
	) {
		super(container, events, config);
		const _config = { ...DEFAULT_ORDER_CONTACTS_CONFIG, ...config };

		// Обязательные элементы
		this._emailInput = ensureElement<HTMLInputElement>(
			_config.emailInputSelector,
			this.container
		);
		this._phoneInput = ensureElement<HTMLInputElement>(
			_config.phoneInputSelector,
			this.container
		);

		// Обработчики событий
		this._setupEventListeners();
	}

	/**
	 * Настройка обработчиков событий
	 */
	protected _setupEventListeners(): void {
		// Реактивная валидация при вводе данных
		this._emailInput.addEventListener('input', () => {
			this.events.emit(OrderEvent.ChangeRequest, {
				changedData: { email: this._emailInput.value },
			});
		});
		this._phoneInput.addEventListener('input', () => {
			this.events.emit(OrderEvent.ChangeRequest, {
				changedData: { phone: this._phoneInput.value },
			});
		});
	}

	protected onSubmit(): void {
		this.events.emit(OrderEvent.SubmitStep);
	}

	/**
	 * Установка email
	 */
	protected set email(value: string) {
		this._emailInput.value = value;
	}

	/**
	 * Установка телефона
	 */
	protected set phone(value: string) {
		this._phoneInput.value = value;
	}

	/**
	 * Основной метод рендеринга компонента
	 */
	protected renderForm(data: Partial<TOrderContacts>): HTMLElement {
		if (data.email !== undefined) {
			this.email = data.email;
		}
		if (data.phone !== undefined) {
			this.phone = data.phone;
		}
		return this.container;
	}
}
