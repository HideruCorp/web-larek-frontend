import { IEvents } from '../base/events';
import * as v from 'valibot';
import {
	IOrderModel,
	IOrderRequest,
	OrderStep,
	OrderEvent,
	IOrderResponse,
	FieldValidity,
	ValidityState,
} from '../../types';
import { validateFields } from '../../utils/validation';
import { pick } from '../../utils/utils';

const PaymentMethodSchema = v.union(
	[v.literal('card'), v.literal('cash')],
	'Необходимо выбрать вариант оплаты'
);

const IOrderRequestSchema = v.object({
	payment: PaymentMethodSchema,
	address: v.pipe(v.string(), v.nonEmpty('Необходимо указать адрес')),
	email: v.pipe(
		v.string(),
		v.nonEmpty('Необходимо указать email'),
		v.email('Указанный email некорректен')
	),
	phone: v.pipe(
		v.string(),
		v.nonEmpty('Необходимо указать номер телефона'),
		v.regex(
			/^([+]?[0-9\s-()]{3,25})*$/i,
			'Указанный номер телефона некорректен'
		)
	),
	total: v.pipe(
		v.number(),
		v.notValue(0, 'Стоимость не может быть равна нулю')
	),
	items: v.pipe(
		v.array(v.pipe(v.string(), v.uuid())),
		v.nonEmpty('Корзина пуста')
	),
});

export class OrderModel implements IOrderModel {
	protected _orderData: IOrderRequest;
	private _orderResponse: IOrderResponse | null;
	protected _currentStep: OrderStep = OrderStep.Cart;

	constructor(protected events: IEvents) {
		this.reset();
	}

	get orderData(): IOrderRequest {
		return { ...this._orderData };
	}

	get orderResponse(): IOrderResponse | null {
		return this._orderResponse;
	}
	set orderResponse(value: IOrderResponse | null) {
		this._orderResponse = value;
		if (this._orderResponse === null) return;

		const success = 'id' in this._orderResponse;
		if (success) {
			this.currentStep = OrderStep.Success;
		} else {
			this.currentStep = OrderStep.Contacts;
			this.events.emit(OrderEvent.OrderFailed);
		}
	}

	get currentStep(): OrderStep {
		return this._currentStep;
	}

	set currentStep(value: OrderStep) {
		if (this._currentStep !== value) {
			this._currentStep = value;
			this.events.emit(OrderEvent.StepChanged, { step: this._currentStep });
		}
	}

	setOrderData(step: OrderStep, data: Partial<IOrderRequest>): void {
		const updatedData = { ...this._orderData, ...data };
		const validity = this.validateData(step, updatedData);
		if (!validity.some((el) => el.state === ValidityState.Invalid)) {
			this._orderData = updatedData;
			this.events.emit(OrderEvent.DataChanged, { data: this._orderData });
			this.currentStep = step;
		} else {
			this.events.emit(OrderEvent.ValidationFailed, validity);
		}
	}

	validate(data: Partial<IOrderRequest>, strict = false): FieldValidity[] {
		return validateFields(IOrderRequestSchema, data, strict);
	}

	submitStep(): void {
		const validity = this.validateData(this.currentStep, this.orderData);
		if (
			validity.some(
				(field) =>
					field.state in [ValidityState.Incomplete, ValidityState.Invalid]
			)
		) {
			this.events.emit(OrderEvent.ValidationFailed, validity);
			return;
		}

		switch (this._currentStep) {
			case OrderStep.Cart:
				this.currentStep = OrderStep.Delivery;
				break;
			case OrderStep.Delivery:
				this.currentStep = OrderStep.Contacts;
				break;
			case OrderStep.Contacts:
				this.events.emit(OrderEvent.SubmitOrderTransaction, this.orderData);
				this.currentStep = OrderStep.SendingOrder;
				break;
			case OrderStep.SendingOrder:
				this.currentStep = OrderStep.Success;
				break;
		}
	}

	reset(): OrderStep {
		this._orderData = {
			items: [],
			total: 0,
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this.orderResponse = null;
		this.currentStep = OrderStep.Cart;
		return this._currentStep;
	}

	protected validateData(
		step: OrderStep,
		data: Partial<IOrderRequest>
	): FieldValidity[] {
		const validity: FieldValidity[] = [];
		if (step in [OrderStep.SendingOrder, OrderStep.Success]) return validity;

		// Валидация товаров в корзине
		if (step in [OrderStep.Cart, OrderStep.Delivery, OrderStep.Contacts]) {
			validity.push(...this.validate(pick(data, 'items', 'total'), true));
		}

		// Валидация способа оплаты и адреса
		if (step in [OrderStep.Delivery, OrderStep.Contacts]) {
			validity.push(...this.validate(pick(data, 'payment', 'address'), true));
		}

		// Валидация контактов
		if (step === OrderStep.Contacts) {
			validity.push(...this.validate(pick(data, 'payment', 'address'), true));
		}

		return validity;
	}
}
