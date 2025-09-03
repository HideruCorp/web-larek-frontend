import { 
  ProductViewConfig, 
} from "../types";

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
  
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
