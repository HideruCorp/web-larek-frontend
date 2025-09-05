import { IApi, IProduct, IOrderRequest, IOrderResponse, ApiListResponse, ILarekApi } from '../types';

export type ApiConfig = {
  cdnUrl: string;
}

const DEFAULT_API_CONFIG: ApiConfig = {
  cdnUrl: ''
}

export class LarekApi implements ILarekApi {
	protected _apiClient: IApi;
  protected _config: ApiConfig;

	constructor(api: IApi, config: Partial<ApiConfig>) {
    this._apiClient = api;
    this._config = { ...DEFAULT_API_CONFIG, ...config };
  }

  /**
   * Получение каталога товаров
   * GET /product - возвращает объект с total и items
   */
  async getProducts(): Promise<IProduct[]> {
    const response = await this._apiClient.get<ApiListResponse<IProduct>>('/product');
    
    // Добавляем CDN_URL к изображениям и возвращаем массив товаров
    return response.items.map(product => ({
      ...product,
      image: this._config.cdnUrl + product.image
    }));
  }

  /**
   * Создание заказа
   * POST /order - принимает данные заказа, возвращает id и total заказа
   */
  async sendOrder(orderData: IOrderRequest): Promise<IOrderResponse> {
    return this._apiClient.post<IOrderResponse>('/order', orderData);
  }
}
