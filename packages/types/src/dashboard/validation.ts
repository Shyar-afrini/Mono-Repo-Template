export type ValidationMessages = {
  required?: string;
  minLength?: string;
  maxLength?: string;
  invalid?: string;
  future?: string;
  /** Cross-field validation (e.g. destination must differ from source). */
  sameAsSource?: string;
  /** Amount or value must not exceed an available balance. */
  exceedsBalance?: string;
  /** Selected value must differ from a paired field (e.g. currency pair). */
  sameCurrency?: string;
};
