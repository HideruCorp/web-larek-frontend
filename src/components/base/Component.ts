import { IComponent } from '../../types';
import { pick } from '../../utils/utils';
import { IEvents } from './events';

/**
 * Тип для описания зависимостей поля
 * Может быть одним полем или массивом полей из T
 */
type FieldDependencies<T> = keyof T | (keyof T)[] | null;

export abstract class Component<T = unknown> implements IComponent<T> {
	protected container: HTMLElement;

	private fieldRegistry = new Map<string, FieldDependencies<T>>();

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
	 * Регистрация поля компонента для рендера
	 * @param property - Имя свойства/сеттера в компоненте
	 * @param dependencies - Одно поле или массив полей из объекта данных (T из Component<T>)
	 *
	 * @example
	 * // Эквивалентное поле (1:1, с тем же названием)
	 * this.addField('title');
	 *
	 * // Простое поле (1:1, с другим названием)
	 * this.addField('title', 'otherKey');
	 *
	 * // Составное поле (1:N)
	 * this.addField('buttonState', ['inCart', 'price']);
	 */
	protected addRenderField(
		property: string,
		dependencies: FieldDependencies<T> = null
	): void {
		this.fieldRegistry.set(property as string, dependencies);
	}

	/**
	 * Применение зарегистрированных полей
	 */
	protected applyRegisteredFields<This extends Component<T>>(
		this: This,
		data: Partial<T>
	): void {
		for (const [property, dependencies] of this.fieldRegistry) {
			const deps =
				dependencies === null
					? [property as keyof T]
					: Array.isArray(dependencies)
					? dependencies
					: [dependencies];

			// Удостоверяемся, что в объекте данных прописаны все необходимые для property поля
			const hasData = deps.every((dep) => data[dep as keyof T] !== undefined);

			if (hasData) {
				// Если зависимость одна - передаем значение напрямую
				if (deps.length === 1) {
					const dep = deps.shift() as keyof T;
					if (data[dep] !== undefined) {
						(this as Record<string, unknown>)[property] = data[dep];
					}
				} else {
					(this as Record<string, unknown>)[property] = pick(
						data,
						...(deps as (keyof T)[])
					);
				}
			}
		}
	}

	/**
	 * Рендер компонента с опциональными данными
	 */
	render(data?: Partial<T>): HTMLElement {
		if (data) {
			this.applyRegisteredFields(data);
		}
		return this.container;
	}
}
