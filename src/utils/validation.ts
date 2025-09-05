import {
	ErrorMessage,
	ObjectEntries,
	ObjectIssue,
	ObjectSchema,
	safeParse,
} from 'valibot';
import { FieldValidity, ValidityState } from '../types';

export function validateFields<
	T,
	const TSchema extends ObjectSchema<
		ObjectEntries,
		ErrorMessage<ObjectIssue> | undefined
	>
>(schema: TSchema, data: Partial<T>, strict = false): FieldValidity[] {
	const validity: FieldValidity[] = [];
	// Валидируем только переданные поля
	console.log(`Проверяем объект`, data);
	for (const [key, value] of Object.entries(data)) {
		if (!Object.keys(schema.entries).includes(key)) continue;
		if (value === undefined) continue;
		const schemaKey = key as keyof typeof schema.entries;
		const valid = safeParse(schema.entries[schemaKey], value);
		const fieldValidity: FieldValidity = {
			field: key,
			state: valid.success
				? ValidityState.Valid
				: strict
				? ValidityState.Invalid
				: ValidityState.Incomplete,
			error: (valid.issues?.length ?? 0) > 0 ? valid.issues[0].message : '',
		};
		validity.push(fieldValidity);
		console.log(`Результат проверки: ${key}:`, fieldValidity);
	}

	return validity;
}
