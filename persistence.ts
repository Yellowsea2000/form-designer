import { FormDataSerializer, FormSchema, StorageManager } from './types';

const STORAGE_PREFIX = 'formcraft:';

export const formDataSerializer: FormDataSerializer = {
  serialize: (formSchema: FormSchema) => JSON.stringify(formSchema),
  deserialize: (data: string) => JSON.parse(data) as FormSchema,
  validate: (data: unknown) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return Boolean(
        parsed &&
          typeof (parsed as FormSchema).id === 'string' &&
          Array.isArray((parsed as FormSchema).components)
      );
    } catch {
      return false;
    }
  },
};

export const storageManager: StorageManager = {
  save: async (key: string, formSchema: FormSchema) => {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, formDataSerializer.serialize(formSchema));
  },
  load: async (key: string) => {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = formDataSerializer.deserialize(raw);
    return parsed;
  },
  list: async () => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  },
  delete: async (key: string) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },
};
