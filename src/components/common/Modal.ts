import { IModalData, ModalConfig, ModalEvent } from '../../types';
import { DEFAULT_MODAL_CONFIG } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Modal extends Component<IModalData> {
	protected _contentContainer: HTMLElement;
	protected _closeButton: HTMLButtonElement;
	protected _openedModifier: string;

	constructor(
		protected modalContainer: HTMLElement,
		events?: IEvents,
		config?: Partial<ModalConfig>
	) {
		super(modalContainer, events);
		const _config = { ...DEFAULT_MODAL_CONFIG, ...config };
		this._openedModifier = _config.openedModifier;

		this._contentContainer = ensureElement(
			_config.contentSelector,
			modalContainer
		);
		this._closeButton = ensureElement<HTMLButtonElement>(
			_config.closeButtonSelector,
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
		this.container.classList.add(this._openedModifier);
		document.addEventListener('keyup', this.handleKeyQuit);
		this.events.emit(ModalEvent.Opened);
	}

	close() {
		this.container.classList.remove(this._openedModifier);
		document.removeEventListener('keyup', this.handleKeyQuit);
		this.events.emit(ModalEvent.Closed);
	}

	isOpened() {
		return this.container.classList.contains(this._openedModifier);
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
