import { 
  CartIconConfig, 
  ProductViewConfig, 
  CartItemViewConfig, 
  CartViewConfig, 
  ModalConfig,
  OrderDeliveryViewConfig,
  OrderContactsViewConfig,
  CartItemFactoryConfig,
  OrderSuccessViewConfig
} from "../types";

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
  
};

export const DEFAULT_MODAL_CONFIG: ModalConfig = {
	contentSelector: '.modal__content',
	closeButtonSelector: '.modal__close',
	openedModifier: 'modal_active',
};

export const DEFAULT_ITEM_VIEW_CONFIG: ProductViewConfig = {
  itemSelectable: true,
  domSelectors: {
    categorySelector: '.card__category',
    titleSelector: '.card__title', 
    descriptionSelector: '.card__text',
    imageSelector: '.card__image',
    priceSelector: '.card__price',
    actionButtonSelector: '.card__button'
  },
  categoryClassMap: {
    'софт-скил': 'card__category_soft',
    'другое': 'card__category_other', 
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'хард-скил': 'card__category_hard'
  }
};

export const DEFAULT_CART_ICON_CONFIG: CartIconConfig = {
  counterSelector: '.header__basket-counter'
};

export const DEFAULT_CART_ITEM_CONFIG: CartItemViewConfig = {
  indexSelector: '.basket__item-index',
  titleSelector: '.card__title',
  priceSelector: '.card__price',
  removeButtonSelector: '.basket__item-delete'
};

export const DEFAULT_CART_ITEM_FACTORY_CONFIG: CartItemFactoryConfig = {
  itemConfig: DEFAULT_CART_ITEM_CONFIG,
  placeholder: {
    elementName: 'span',
    classList: 'card_compact basket__placeholder',
    text: 'Корзина пуста'
  }
}

export const DEFAULT_CART_VIEW_CONFIG: CartViewConfig = {
  listSelector: '.basket__list',
  totalSelector: '.basket__price',
  checkoutSelector: '.basket__button',
};

export const DEFAULT_ORDER_DELIVERY_CONFIG: OrderDeliveryViewConfig = {
  paymentButtonSelector: '.button_alt',
  paymentMethodMapping: [
    { name: 'card', method: 'card' },
    { name: 'cash', method: 'cash' },
  ],
	addressInputSelector: '.form__input[name="address"]',
	submitButtonSelector: 'button[type="submit"]',
	errorSelector: '.form__errors',
	activeButtonModifier: 'button_alt-active'
};

export const DEFAULT_ORDER_CONTACTS_CONFIG: OrderContactsViewConfig = {
	emailInputSelector: '.form__input[name="email"]',
	phoneInputSelector: '.form__input[name="phone"]',
	submitButtonSelector: 'button[type="submit"]',
	errorSelector: '.form__errors'
};

export const DEFAULT_ORDER_SUCCESS_CONFIG: OrderSuccessViewConfig = {
	totalSelector: '.order-success__description',
	closeButtonSelector: '.order-success__close'
};
