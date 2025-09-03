export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function isSelector(x: any): x is string {
    return (typeof x === "string") && x.length > 1;
}

export function isEmpty(value: any): boolean {
    return value === null || value === undefined;
}

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];

export type ClassInstanceType<T> = T extends new (...args: unknown[]) => infer I
  ? I
  : T;

export type TypeFrom<T, K extends keyof ClassInstanceType<T>> = ClassInstanceType<T>[K];

export type QueryContext = HTMLElement | Document | DocumentFragment | HTMLTemplateElement;

export function ensureAllElements<T extends HTMLElement>(
  selectorElement: SelectorCollection<T>, 
  context?: QueryContext
): T[] {
  let searchContext: ParentNode;
  
  if (!context) {
    searchContext = document;
  } else if (context instanceof HTMLTemplateElement) {
    searchContext = context.content;
  } else {
    searchContext = context;
  }
  
  if (isSelector(selectorElement)) {
    return Array.from(searchContext.querySelectorAll<T>(selectorElement));
  }
  if (selectorElement instanceof NodeList) {
    return Array.from(selectorElement) as T[];
  }
  if (Array.isArray(selectorElement)) {
    return selectorElement;
  }
  throw new Error(`Unknown selector element`);
}

export type SelectorElement<T> = T | string;

export function ensureElement<T extends HTMLElement>(
  selectorElement: SelectorElement<T>, 
  context?: QueryContext
): T {
  // Нормализуем контекст
  let searchContext: ParentNode;
  
  if (!context) {
    searchContext = document;
  } else if (context instanceof HTMLTemplateElement) {
    searchContext = context.content;
  } else {
    searchContext = context;
  }
    
  if (isSelector(selectorElement)) {
    const elements = Array.from(
      searchContext.querySelectorAll<T>(selectorElement)
    );
    
    if (elements.length > 1) {
      console.warn(`selector ${selectorElement} return more then one element`);
    }
    if (elements.length === 0) {
      throw new Error(`selector ${selectorElement} return nothing in context`);
    }
    return elements[0];
  }
  
  if (selectorElement instanceof HTMLElement) {
    return selectorElement as T;
  }
  
  throw new Error('Unknown selector element');
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    const template = ensureElement(query) as HTMLTemplateElement;
    return template.content.firstElementChild.cloneNode(true) as T;
}

export function bem(block: string, element?: string, modifier?: string): { name: string, class: string } {
    let name = block;
    if (element) name += `__${element}`;
    if (modifier) name += `_${modifier}`;
    return {
        name,
        class: `.${name}`
    };
}

export function getObjectProperties(obj: object, filter?: (name: string, prop: PropertyDescriptor) => boolean): string[] {
    return Object.entries(
        Object.getOwnPropertyDescriptors(
            Object.getPrototypeOf(obj)
        )
    )
        .filter(([name, prop]: [string, PropertyDescriptor]) => filter ? filter(name, prop) : (name !== 'constructor'))
        .map(([name, prop]) => name);
}

/**
 * Устанавливает dataset атрибуты элемента
 */
export function setElementData<T extends Record<string, unknown> | object>(el: HTMLElement, data: T) {
    for (const key in data) {
        el.dataset[key] = String(data[key]);
    }
}

/**
 * Получает типизированные данные из dataset атрибутов элемента
 */
/* eslint-disable @typescript-eslint/ban-types */
export function getElementData<T extends Record<string, unknown>>(el: HTMLElement, scheme: Record<string, Function>): T {
    const data: Partial<T> = {};
    for (const key in el.dataset) {
        data[key as keyof T] = scheme[key](el.dataset[key]);
    }
    return data as T;
}

/**
 * Проверка на простой объект
 */
export function isPlainObject(obj: unknown): obj is object {
    const prototype = Object.getPrototypeOf(obj);
    return  prototype === Object.getPrototypeOf({}) ||
        prototype === null;
}

export function isBoolean(v: unknown): v is boolean {
    return typeof v === 'boolean';
}

/**
 * Фабрика DOM-элементов в простейшей реализации
 * здесь не учтено много факторов
 * в интернете можно найти более полные реализации
 */
export function createElement<
    T extends HTMLElement
    >(
    tagName: keyof HTMLElementTagNameMap,
    props?: Partial<Record<keyof T, string | boolean | object>>,
    children?: HTMLElement | HTMLElement []
): T {
    const element = document.createElement(tagName) as T;
    if (props) {
        for (const key in props) {
            const value = props[key];
            if (isPlainObject(value) && key === 'dataset') {
                setElementData(element, value);
            } else {
                // @ts-expect-error fix indexing later
                element[key] = isBoolean(value) ? value : String(value);
            }
        }
    }
    if (children) {
        for (const child of Array.isArray(children) ? children : [children]) {
            element.append(child);
        }
    }
    return element;
}

/**
 * Форматирует число, добавляя пробелы между разрядами только для чисел от 10000 и выше
 * Соответствует логике макета: числа до 9999 отображаются без разделителей
 * @param number - Число для форматирования
 * @returns Строка с отформатированным числом (например: "1500" или "10 000")
 */
export function formatPrice(number: number): string {
  // Для чисел меньше 10000 - без форматирования (как в макете)
  if (number < 10000) {
    return number.toString();
  }
  // Для чисел от 10000 и выше - с разделителем пробелом
  return number.toLocaleString('ru-RU');
}
