import { useState, type FormEvent } from 'react';
import { errorMessage, fieldErrors } from '../utils/errorMessage';

/**
 * Formularzustand mit API-Fehlerbehandlung: Feldfehler (422) landen in `errors`,
 * alles andere in `formError`.
 */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (action: (values: T) => Promise<void>) => async (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);
    try {
      await action(values);
    } catch (e) {
      const fields = fieldErrors(e);
      setErrors(fields);
      setFormError(Object.keys(fields).length > 0 ? null : errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, set, setValues, errors, formError, submitting, handleSubmit };
}
