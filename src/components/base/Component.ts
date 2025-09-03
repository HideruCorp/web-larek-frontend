import { IComponent } from "../../types";
import { IEvents } from "./events";

export abstract class Component<T = unknown> implements IComponent<T> {
  protected container: HTMLElement;
  
  constructor(container: HTMLElement, protected events?: IEvents) {
    this.container = container;
  }
  
  /**
   * Установка текстового содержимого элемента
   */
  protected setText(element: HTMLElement, value: string): void {
    if (element) {
      element.textContent = value;
    }
  }
  
  /**
   * Переключение CSS класса элемента
   */
  protected toggleClass(element: HTMLElement, className: string, state?: boolean): void {
    element.classList.toggle(className, state);
  }
  
  /**
   * Установка атрибута disabled для кнопки или инпута
   */
  protected setDisabled(element: HTMLElement, state: boolean): void {
    if ('disabled' in element) {
      (element as HTMLButtonElement | HTMLInputElement).disabled = state;
    }
  }
  
  /**
   * Установка изображения
   */
  protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
    if (element) {
      element.src = src;
      if (alt) {
        element.alt = alt;
      }
    }
  }
  
  /**
   * Рендер компонента с опциональными данными
   */
  abstract render(data?: Partial<T>): HTMLElement;

}


