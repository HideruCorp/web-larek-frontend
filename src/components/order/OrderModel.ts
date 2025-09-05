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
	TOrderParameters,
} from '../../types';
import { validateFields } from '../../utils/validation';
import { pick } from '../../utils/utils';

const PaymentMethodSchema = v.union(
	[v.literal('card'), v.literal('cash')],
	'Необходимо выбрать вариант оплаты'
);

const TOrderParametersSchema = v.object({
	payment: PaymentMethodSchema,
	address: v.pipe(v.string(), v.nonEmpty('Необходимо указать адрес')),
	email: v.pipe(v.string(), v.nonEmpty('Необходимо указать email')),
	phone: v.pipe(v.string(), v.nonEmpty('Необходимо указать номер телефона')),
});

export class OrderModel implements IOrderModel {
	protected _orderData: TOrderParameters;
	private _orderResponse: IOrderResponse | null;
	protected _currentStep: OrderStep = OrderStep.Cart;

	constructor(protected events: IEvents) {
		this.reset();
	}

	get orderParameters(): TOrderParameters {
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

	setOrderParameters(data: Partial<TOrderParameters>): void {
		const updatedData = { ...this._orderData, ...data };
		const validity = this.validate(data);
		if (!validity.some((el) => el.state === ValidityState.Invalid)) {
			this._orderData = updatedData;
			this.events.emit(OrderEvent.DataChanged, { data: this._orderData });
		} else {
			this.events.emit(OrderEvent.ValidationFailed, validity);
		}
	}

	validate(data: Partial<TOrderParameters>, strict = false): FieldValidity[] {
		return validateFields(TOrderParametersSchema, data, strict);
	}

	submitStep(): void {
		const validity = this.validateData(this.currentStep, this.orderParameters);
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
				this.events.emit(
					OrderEvent.SubmitOrderTransaction,
					this.orderParameters
				);
				this.currentStep = OrderStep.SendingOrder;
				break;
			case OrderStep.SendingOrder:
				this.currentStep = OrderStep.Success;
				break;
		}
	}

	reset(): OrderStep {
		this._orderData = {
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
		if (step in [OrderStep.Cart, OrderStep.SendingOrder, OrderStep.Success])
			return validity;

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
