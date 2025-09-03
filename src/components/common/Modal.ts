import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export type ModalConfig = {
	contentSelector: string;
	closeButtonSelector: string;
	openedModifier: string;
};

const DEFAULT_MODAL_CONFIG: ModalConfig = {
	contentSelector: '.modal__content',
	closeButtonSelector: '.modal__close',
	openedModifier: 'modal_active',
};

export type IModalData = {
	content: HTMLElement;
};

export class Modal extends Component<IModalData> {
	protected _contentContainer: HTMLElement;
	protected _closeButton: HTMLButtonElement;
	protected _config: ModalConfig;

	constructor(
		protected modalContainer: HTMLElement,
		events?: IEvents,
		config?: Partial<ModalConfig>
	) {
		super(modalContainer, events);
		this._config = { ...DEFAULT_MODAL_CONFIG, ...config };

		this._contentContainer = ensureElement(
			this._config.contentSelector,
			modalContainer
		);
		this._closeButton = ensureElement<HTMLButtonElement>(
			this._config.closeButtonSelector,
			modalContainer
		);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('mousedown', (evt) => {
			if (evt.target === evt.currentTarget) {
				this.close();
			}
		});
		this.handleKeyQuit = this.handleKeyQuit.bind(this);
	}

	open() {
		this.container.classList.add(this._config.openedModifier);
		document.addEventListener('keyup', this.handleKeyQuit);
		this.events.emit('modal:opened');
	}

	close() {
		this.container.classList.remove(this._config.openedModifier);
		document.removeEventListener('keyup', this.handleKeyQuit);
		this.events.emit('modal:closed');
	}

	isOpened() {
		return this.container.classList.contains(this._config.openedModifier);
	}

	render(data?: Partial<IModalData>): HTMLElement {
		this._contentContainer.replaceChildren(data.content);
		return this.modalContainer;
	}

	handleKeyQuit(evt: KeyboardEvent) {
		if (evt.key === 'Escape') {
			this.close();
		}
	}
}
