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
	ValidityState,
} from './types';
import { IEvents } from './components/base/events';
import { pick, TypeFrom } from './utils/utils';

export class AppPresenter {
	private events: IEvents;
	private larekApi: ILarekApi;
	private modal: IModal;
	private productDetailView: IComponent<IProductViewData>;
	private productGalleryView: IComponent<IProduct[]>;
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
		// Product events
		this.events.on(
			ProductEvent.CardClicked,
			(item: { id: TypeFrom<IProduct, 'id'> }) => {
				console.log(`Получили клик по элементу с id: ${item.id}`);
				if (this.modal.isOpened()) {
					console.warn(
						'При открытом модальном окне элементы галлереи не кликабельны'
					);
					return;
				}
				this.productModel.selection = item.id;
			}
		);

		this.events.on(
			ProductEvent.ActionCalled,
			(item: { id: TypeFrom<IProduct, 'id'> }) => {
				console.log(`Кликнули по кнопке в превью: ${item.id}`);
				if (!this.cartModel.hasProduct(item.id)) {
					const cartItem: TCartItem = this.productModel.getProduct(item.id);
					this.cartModel.addProduct(cartItem);
				} else {
					this.cartModel.removeProduct(item.id);
				}
			}
		);

		// Cart events
		this.events.on(CartEvent.ItemsChanged, () => {
			console.log(`Изменился список в корзине: ${this.cartModel.items}`);

			this.cartIcon.render({ count: this.cartModel.count });

			const cartItems: ICartItemData[] = this.cartModel.items.map(
				(productId, index) => {
					const product = this.productModel.getProduct(productId);
					return {
						...product,
						cartIndex: index + 1,
					} as ICartItemData;
				}
			);

			const cartData: ICartViewData = {
				items: cartItems,
				totalCost: this.cartModel.totalCost,
				isEmpty: this.cartModel.isEmpty,
			};

			this.cartView.render(cartData);

			console.log(
				`Корзина обновилась. selection: ${this.productModel.selection}`
			);
			if (this.productModel.selection !== null) {
				const itemData = {
					...this.productModel.getProduct(this.productModel.selection),
					inCart: this.cartModel.hasProduct(this.productModel.selection),
				} as IProductViewData;
				this.productDetailView.render(itemData);
			}
		});

		this.events.on(CartEvent.IconClicked, () => {
			console.log('Открываем корзину');
			if (this.modal.isOpened()) {
				console.warn('Модальное окно уже занято');
				return;
			}
			this.productModel.selection = null;

			const cartItems: ICartItemData[] = this.cartModel.items.map(
				(productId, index) => {
					const product = this.productModel.getProduct(productId);
					return {
						...product,
						cartIndex: index + 1,
					} as ICartItemData;
				}
			);

			const cartData: ICartViewData = {
				items: cartItems,
				totalCost: this.cartModel.totalCost,
				isEmpty: this.cartModel.isEmpty,
			};

			this.modal.render({ content: this.cartView.render(cartData) });
			this.modal.open();
		});

		this.events.on(CartEvent.CheckoutClicked, () => {
			console.log('Переходим к оформлению заказа');

			this.orderModel.setOrderData(OrderStep.Cart, {
				items: this.cartModel.items,
				total: this.cartModel.totalCost,
			});
			this.orderModel.submitStep();
		});

		this.events.on(
			CartEvent.ItemDeleteClicked,
			(item: { id: TypeFrom<IProduct, 'id'> }) => {
				console.log(`Удаляем товар из корзины: ${item.id}`);
				this.cartModel.removeProduct(item.id);
			}
		);

		// Order events
		this.events.on(OrderEvent.StepChanged, (data: { step: OrderStep }) => {
			console.log(`Шаг заказа изменился на ${data.step}`);
			switch (data.step) {
				case OrderStep.Delivery: {
					const orderDelivery = pick(
						this.orderModel.orderData,
						'payment',
						'address'
					);
					const deliveryData = {
						...orderDelivery,
						validity: this.orderModel.validate(orderDelivery, false),
					};
					this.modal.render({
						content: this.orderDeliveryView.render(deliveryData),
					});
					break;
				}

				case OrderStep.Contacts: {
					const orderContacts = pick(
						this.orderModel.orderData,
						'email',
						'phone'
					);
					const contactsData = {
						...orderContacts,
						validity: this.orderModel.validate(orderContacts, false),
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

		this.events.on(
			OrderEvent.ValidateRequest,
			(req: { step: OrderStep; data: Partial<IOrderRequest> }) => {
				const validity = this.orderModel.validate(req.data);
				if (req.step === OrderStep.Delivery) {
					this.orderDeliveryView.render({ validity });
				} else if (req.step === OrderStep.Contacts) {
					this.orderContactsView.render({ validity });
				}
			}
		);

		this.events.on(
			OrderEvent.SubmitStep,
			(data: { step: OrderStep; data: Partial<IOrderRequest> }) => {
				console.log('Финальная валидация шага:', data);
				this.orderModel.setOrderData(data.step, data.data);
				this.orderModel.submitStep();
			}
		);

		this.events.on(OrderEvent.SubmitOrderTransaction, () => {
			console.log('Отправляем заказ:', this.orderModel.orderData);

			this.larekApi
				.sendOrder(this.orderModel.orderData)
				.then((response) => {
					console.log('Заказ успешно оформлен:', response);
					this.orderModel.orderResponse = response;
				})
				.catch((error) => {
					console.error('Ошибка оформления заказа:', error);
					this.orderModel.orderResponse = { error };
				});
		});

		this.events.on(OrderEvent.ValidationFailed, (validity: FieldValidity[]) => {
			console.log('Валидация не прошла:', validity);

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
						this.orderModel.orderData,
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
					const orderDelivery = pick(
						this.orderModel.orderData,
						'email',
						'phone'
					);
					this.orderContactsView.render({
						...orderDelivery,
						validity: this.orderModel.validate(orderDelivery),
					});
					break;
				}
			}
		});

		this.events.on(OrderEvent.OrderFailed, () => {
			console.log('Заказ провалился:');
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
			console.log('Закрываем экран успешного заказа');
			this.modal.close();
			this.orderModel.reset();
		});

		// Modal events
		this.events.on(ModalEvent.Closed, () => {
			this.productModel.selection = null;

			if (this.orderModel.currentStep !== OrderStep.Cart) {
				this.orderModel.reset();
			}
		});

		// Gallery events
		this.events.on(GalleryEvent.SelectionChanged, () => {
			console.log(
				`Изменился выбранный товар на ${this.productModel.selection}`
			);
			if (this.productModel.selection === null) return;
			const itemData = {
				...this.productModel.getProduct(this.productModel.selection),
				inCart: this.cartModel.hasProduct(this.productModel.selection),
			};
			this.modal.render({ content: this.productDetailView.render(itemData) });
			this.modal.open();
		});

		this.events.on(GalleryEvent.ItemsChanged, () => {
			console.log(`Список товаров обновился. Обновим галерею...`);
			this.productGalleryView.render(this.productModel.items);
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
