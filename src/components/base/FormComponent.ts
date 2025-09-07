import { Component } from './Component';
import { ValidityState, FieldValidity, FormData, FormViewConfig } from '../../types';
import { IEvents } from './events';
import { ensureElement } from '../../utils/utils';
import { DEFAULT_FORM_CONFIG } from '../../utils/constants';

export abstract class FormComponent<T> extends Component<FormData<T>> {
	protected _formElement: HTMLFormElement;
	protected _errorElement?: HTMLElement;
	protected _submitButton: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		events: IEvents,
		formConfig?: Partial<FormViewConfig>
	) {
		super(container, events);
		const config = { ...DEFAULT_FORM_CONFIG, ...formConfig };

		// Обязательные элементы
		this._formElement = container as HTMLFormElement;
		this._submitButton = ensureElement<HTMLButtonElement>(
			config.submitButtonSelector,
			container
		);

		if (config.errorSelector) {
			this._errorElement = container.querySelector(config.errorSelector);
		}

		// Обработчики событий
		this._formElement.addEventListener('submit', (e) => {
			e.preventDefault();
			this.onSubmit();
		});

		this.addRenderField('validity');
	}

	protected set validity(validity: FieldValidity[]) {
		const invalid = validity.filter((field) => field.state === ValidityState.Invalid);
		if (invalid.length > 0) {
			if (this._errorElement) {
				this.setText(this._errorElement, invalid.shift().error);
			}
			this.setDisabled(this._submitButton, true);
		} else {
			const incomplete = validity.filter(
				(field) => field.state === ValidityState.Incomplete
			);
			const incompleteCount = incomplete.length;
			if (this._errorElement) {
				this.setText(
					this._errorElement,
					incompleteCount > 0 && incompleteCount !== validity.length
						? incomplete.shift().error
						: ''
				);
			}
			this.setDisabled(this._submitButton, incompleteCount > 0);
		}
	}

	protected abstract onSubmit(): void;
}
