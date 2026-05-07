export type AsyncComboBoxValue = {
  id: string;
  label: string;
};

export type AsyncComboBoxFetchPageArgs = {
  q: string;
  page: number;
  limit: number;
};

export type AsyncComboBoxFetchPageResult<T> = {
  items: T[];
  hasMore: boolean;
};

export type AsyncComboBoxMessages = {
  loading: string;
  loadingMore: string;
  empty: string;
  error: string;
  retry: string;
};

export type AsyncComboBoxRenderTriggerContext = {
  open: boolean;
  disabled?: boolean;
  valueId: string;
  triggerLabel: string | null;
  placeholder: string;
  showTriggerLoading: boolean;
};

export type AsyncComboBoxProps<T> = {
  /** Wrapper width control. Use `w-fit` for toolbar filters, `w-full` for sheets. */
  readonly containerClassName?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;

  readonly valueId: string;
  /** Used when the selected id isn't in the current pages yet (e.g. prefilled from store/url). */
  readonly selectedDisplayLabel?: string;
  readonly onValueChange: (next: AsyncComboBoxValue | null) => void;
  /** Optional: get the full selected item (e.g. for balance validation). */
  readonly onSelectItem?: (item: T) => void;

  readonly placeholder: string;
  /** Placeholder for the editable search input. */
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;

  readonly queryKey: readonly unknown[];
  readonly fetchPage: (
    args: AsyncComboBoxFetchPageArgs
  ) => Promise<AsyncComboBoxFetchPageResult<T>>;

  readonly limit?: number;
  readonly debounceMs?: number;
  readonly minWidth?: number;
  readonly maxMenuHeightClassName?: string;

  readonly getItemId: (item: T) => string;
  readonly getItemLabel: (item: T) => string;
  readonly renderItem?: (item: T, state: { selected: boolean }) => React.ReactNode;

  /** Optional override for translated strings. */
  readonly messages?: Partial<AsyncComboBoxMessages>;

  /** Optional: custom trigger renderer (useful for toolbar filters to preserve width/icons). */
  readonly renderTrigger?: (
    ctx: AsyncComboBoxRenderTriggerContext
  ) => React.ReactNode;
};

