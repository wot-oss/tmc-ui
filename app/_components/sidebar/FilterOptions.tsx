import { capitalize } from '@/lib/utils/strings';
import { type FilterData, type FilterKey } from '../inventory/types';

interface FilterOptionsProps {
  sectionId: FilterKey;
  options: readonly FilterData[] | { errorMessage: string };
  onOptionChange: (filterKey: FilterKey, optionValue: string) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ sectionId, options, onOptionChange }) => {
  if ('errorMessage' in options)
    return <div className="text-text-primary text-sm">{options.errorMessage}</div>;

  return (
    <div aria-label={`${sectionId} options`} className="max-h-32 overflow-y-auto">
      {options.map((option, optionIdx) => (
        <div key={option.value} className="flex gap-3">
          <div className="flex h-5 shrink-0 items-center">
            <div className="group relative grid size-4 grid-cols-1">
              <input
                id={`filter-${sectionId}-${optionIdx}`}
                name={`${sectionId}[]`}
                value={option.value}
                checked={option.checked}
                type="checkbox"
                onChange={() => onOptionChange(sectionId, option.value)}
                className="peer col-start-1 row-start-1 size-4 appearance-none rounded-xs focus-visible:outline-none disabled:cursor-not-allowed forced-colors:appearance-auto"
              />
              <span className="border-focus-ring pointer-events-none absolute -top-0.5 -left-0.5 h-5 w-5 rounded-sm border opacity-0 peer-focus-visible:opacity-100" />
              <svg
                fill="none"
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 size-4 self-center justify-self-center"
              >
                <rect
                  width="16"
                  height="16"
                  rx="2"
                  className="stroke-text-primary group-hover:fill-surface-input-hover group-hover:stroke-interactive-hover group-has-checked:fill-interactive-pressed group-has-disabled:fill-media group-has-checked:stroke-interactive-pressed group-has-disabled:stroke-text-marker fill-transparent"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.01428 9.85976L11.7739 2.73831L13.4367 3.84965L7.32081 13.0004L2.7594 8.42398L4.17593 7.01209L7.01428 9.85976Z"
                  className="fill-text-inverse-strong group-has-disabled:fill-text-tertiary opacity-0 group-has-checked:opacity-100"
                />
              </svg>
            </div>
          </div>

          <label
            htmlFor={`filter-${sectionId}-${optionIdx}`}
            className="text-text-primary hover:text-text-secondary text-sm"
          >
            {capitalize(option.value)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default FilterOptions;
