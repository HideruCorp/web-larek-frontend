import {
	CartEvent,
	FieldValidity,
	FormData,
	GalleryEvent,
	IAppPresenterDependencies,
	ICartItemData,
	ICartModel,
	ICartViewData,
	IComponent,
	ILarekApi,
	IModal,
	IOrderModel,
	IOrderRequest,
	IProduct,
	IProductModel,
	IProductViewData,
	ModalEvent,
	OrderEvent,
	OrderStep,
	ProductEvent,
	TCartInfo,
	TCartItem,
	TOrderContacts,
	TOrderDelivery,
	TOrderError,
	TOrderSuccess,
	TOrderChangeRequest,
	ValidityState,
	IGalleryViewData,
} from '../types';
import { IEvents } from './base/events';
import { pick, TypeFrom } from '../utils/utils';

export class AppPresenter {
	private events: IEvents;
	private larekApi: ILarekApi;
	private modal: IModal;
	private productDetailView: IComponent<IProductViewData>;
	private productGalleryView: IComponent<IGalleryViewData>;
	private productModel: IProductModel;
	private cartModel: ICartModel;
	private orderModel: IOrderModel;
	private cartIcon: IComponent<TCartInfo>;
	private cartView: IComponent<ICartViewData>;
	private orderDeliveryView: IComponent<FormData<TOrderDelivery>>;
	private orderContactsView: IComponent<FormData<TOrderContacts>>;
	private orderSuccessView: IComponent<TOrderSuccess>;

	constructor(dependencies: IAppPresenterDependencies) {
		// Распаковываем зависимости
		this.events = dependencies.events;
		this.larekApi = dependencies.larekApi;
		this.modal = dependencies.modal;
		this.productDetailView = dependencies.product.productDetailView;
		this.productGalleryView = dependencies.product.productGalleryView;
		this.productModel = dependencies.product.productModel;
		this.cartModel = dependencies.cart.cartModel;
		this.cartIcon = dependencies.cart.cartIcon;
		this.cartView = dependencies.cart.cartView;
		this.orderModel = dependencies.order.orderModel;
		this.orderDeliveryView = dependencies.order.orderDeliveryView;
		this.orderContactsView = dependencies.order.orderContactsView;
		this.orderSuccessView = dependencies.order.orderSuccessView;

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		// События галереи
		this.events.on(GalleryEvent.SelectionChanged, () => {
			if (this.productModel.selection === null) return;
			const itemData = {
				...this.productModel.getProduct(this.productModel.selection),
				inCart: this.cartModel.hasProduct(this.productModel.selection),
			};
			this.modal.render({ content: this.productDetailView.render(itemData) });
			this.modal.open();
		});

		this.events.on(GalleryEvent.ItemsChanged, () => {
			this.productGalleryView.render({ items: this.productModel.items });
		});

		// События карточки
		this.events.on(ProductEvent.CardClicked, (item: { id: TypeFrom<IProduct, 'id'> }) => {
			if (this.modal.isOpened) {
				console.warn('При открытом модальном окне элементы галлереи не кликабельны');
				return;
			}
			this.productModel.selection = item.id;
		});

		this.events.on(
			ProductEvent.ActionCalled,
			(item: { id: TypeFrom<IProduct, 'id'> }) => {
				if (!this.cartModel.hasProduct(item.id)) {
					const cartItem: TCartItem = this.productModel.getProduct(item.id);
					this.cartModel.addProduct(cartItem);
				} else {
					this.cartModel.removeProduct(item.id);
				}
			}
		);

		// События корзины
		this.events.on(CartEvent.ItemsChanged, () => {
			this.cartIcon.render({ count: this.cartModel.count });

			const cartItems: ICartItemData[] = this.cartModel.items.map((productId, index) => {
				const product = this.productModel.getProduct(productId);
				return {
					...product,
					cartIndex: index + 1,
				} as ICartItemData;
			});

			const cartData: ICartViewData = {
				items: cartItems,
				totalCost: this.cartModel.totalCost,
				isEmpty: this.cartModel.isEmpty,
			};

			this.cartView.render(cartData);

			if (this.productModel.selection !== null) {
				const itemData = {
					...this.productModel.getProduct(this.productModel.selection),
					inCart: this.cartModel.hasProduct(this.productModel.selection),
				} as IProductViewData;
				this.productDetailView.render(itemData);
			}
		});

		this.events.on(CartEvent.IconClicked, () => {
			if (this.modal.isOpened) {
				console.warn('Модальное окно уже занято');
				return;
			}
			this.productModel.selection = null;

			const cartItems: ICartItemData[] = this.cartModel.items.map((productId, index) => {
				const product = this.productModel.getProduct(productId);
				return {
					...product,
					cartIndex: index + 1,
				} as ICartItemData;
			});

			const cartData: ICartViewData = {
				items: cartItems,
				totalCost: this.cartModel.totalCost,
				isEmpty: this.cartModel.isEmpty,
			};

			this.modal.render({ content: this.cartView.render(cartData) });
			this.modal.open();
		});

		this.events.on(CartEvent.CheckoutClicked, () => {
			this.orderModel.currentStep = OrderStep.Delivery;
		});

		this.events.on(
			CartEvent.ItemDeleteClicked,
			(item: { id: TypeFrom<IProduct, 'id'> }) => {
				this.cartModel.removeProduct(item.id);
			}
		);

		// События заказа
		this.events.on(OrderEvent.StepChanged, (data: { step: OrderStep }) => {
			switch (data.step) {
				case OrderStep.Delivery: {
					const orderDelivery = pick(
						this.orderModel.orderParameters,
						'payment',
						'address'
					);
					const deliveryData = {
						...orderDelivery,
						validity: this.orderModel.validate(orderDelivery),
					};
					this.modal.render({
						content: this.orderDeliveryView.render(deliveryData),
					});
					break;
				}

				case OrderStep.Contacts: {
					const orderContacts = pick(this.orderModel.orderParameters, 'email', 'phone');
					const contactsData = {
						...orderContacts,
						validity: this.orderModel.validate(orderContacts),
					};
					this.modal.render({
						content: this.orderContactsView.render(contactsData),
					});
					break;
				}

				case OrderStep.Success: {
					const orderSuccess = this.orderModel.orderResponse as TOrderSuccess;
					this.modal.render({
						content: this.orderSuccessView.render(orderSuccess),
					});
					this.cartModel.clear();
					break;
				}

				case OrderStep.Cart:
					this.modal.render({ content: this.cartView.render() });
					break;
			}
		});

		this.events.on(OrderEvent.ChangeRequest, (req: TOrderChangeRequest) => {
			this.orderModel.setOrderParameters(req.changedData);
		});

		this.events.on(OrderEvent.SubmitStep, () => {
			this.orderModel.submitStep();
		});

		this.events.on(OrderEvent.SubmitOrderTransaction, () => {
			const orderRequest: IOrderRequest = {
				...this.orderModel.orderParameters,
				items: this.cartModel.items,
				total: this.cartModel.totalCost,
			};
			this.larekApi
				.sendOrder(orderRequest)
				.then((response) => {
					this.orderModel.orderResponse = response;
				})
				.catch((error) => {
					this.orderModel.orderResponse = { error };
				});
		});

		this.events.on(OrderEvent.ValidationFailed, (validity: FieldValidity[]) => {
			if (this.orderModel.currentStep === OrderStep.Delivery) {
				this.orderDeliveryView.render({ validity });
			} else if (this.orderModel.currentStep === OrderStep.Contacts) {
				this.orderContactsView.render({ validity });
			}
		});

		this.events.on(OrderEvent.DataChanged, () => {
			switch (this.orderModel.currentStep) {
				case OrderStep.Delivery: {
					const orderDelivery = pick(
						this.orderModel.orderParameters,
						'payment',
						'address'
					);
					this.orderDeliveryView.render({
						...orderDelivery,
						validity: this.orderModel.validate(orderDelivery),
					});
					break;
				}

				case OrderStep.Contacts: {
					const orderDelivery = pick(this.orderModel.orderParameters, 'email', 'phone');
					this.orderContactsView.render({
						...orderDelivery,
						validity: this.orderModel.validate(orderDelivery),
					});
					break;
				}
			}
		});

		this.events.on(OrderEvent.OrderFailed, () => {
			const orderError = this.orderModel.orderResponse as TOrderError;
			this.orderContactsView.render({
				validity: [
					{
						field: 'order',
						state: ValidityState.Invalid,
						error: orderError.error,
					},
				],
			});
		});

		this.events.on(OrderEvent.SuccessClose, () => {
			this.modal.close();
			this.orderModel.reset();
		});

		// События модельного окна
		this.events.on(ModalEvent.Closed, () => {
			this.productModel.selection = null;

			if (this.orderModel.currentStep !== OrderStep.Cart) {
				this.orderModel.reset();
			}
		});
	}

	loadInitialData(): void {
		this.larekApi
			.getProducts()
			.then((products) => {
				this.productModel.items = products;
			})
			.catch((error) => {
				console.error('Ошибка загрузки товаров:', error);
			});
	}
}
