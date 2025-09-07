import { IModal, IModalData, ModalConfig, ModalEvent } from '../../types';
import { DEFAULT_MODAL_CONFIG } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Modal extends Component<IModalData> implements IModal {
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

		this._contentContainer = ensureElement(_config.contentSelector, modalContainer);
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
		this.addRenderField('content');
	}

	open() {
		this.toggleClass(this.container, this._openedModifier, true);
		document.addEventListener('keyup', this.handleKeyQuit);
		this.events.emit(ModalEvent.Opened);
	}

	close() {
		this.toggleClass(this.container, this._openedModifier, false);
		document.removeEventListener('keyup', this.handleKeyQuit);
		this.events.emit(ModalEvent.Closed);
	}

	get isOpened(): boolean {
		return this.container.classList.contains(this._openedModifier);
	}

	protected set content(value: HTMLElement) {
		this._contentContainer.replaceChildren(value);
	}

	protected handleKeyQuit(evt: KeyboardEvent) {
		if (evt.key === 'Escape') {
			this.close();
		}
	}
}
