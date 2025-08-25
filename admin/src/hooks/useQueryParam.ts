import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface useQueryParamProps<T extends Record<string, any>> {
  defaultParam: T;
  options?: {
    resetOnSearch?: boolean;
    validatePage?: boolean;
  };
}

export function useQueryParam<T extends Record<string, any>>({
  defaultParam,
  options = {
    resetOnSearch: false,
    validatePage: false,
  },
}: useQueryParamProps<T>) {
  const [searchParam, setSearchParam] = useSearchParams();

  const queryParam = useMemo(() => {
    const params = { ...defaultParam } as T;
    Object.entries(defaultParam).forEach(([key, paramValue]) => {
      const value = searchParam.get(key);
      if (value !== null) {
        if (typeof paramValue === 'number') {
          (params as any)[key] = Number(value) || paramValue;
        } else if (typeof paramValue === 'boolean') {
          (params as any)[key] = value === 'true';
        } else {
          (params as any)[key] = value;
        }
      }
    });
    searchParam.forEach((value, key) => {
      if (!(key in defaultParam)) {
        (params as any)[key] = value;
      }
    });
    return params;
  }, [searchParam]);

  const handleParamsChange = useCallback(
    (params: Partial<T>) => {
      let urlSearchParam: URLSearchParams = new URLSearchParams(searchParam);
      Object.entries(params).forEach(([key, value]) => {
        if (options.resetOnSearch && 'search' in params) {
          urlSearchParam = new URLSearchParams();
          if (params.search) {
            urlSearchParam.set('search', String(params.search));
          }
        } else {
          urlSearchParam = new URLSearchParams(searchParam);
        }
        if (options.validatePage && key === 'page') {
          const pageNumber = Number(value);
          if (pageNumber < 1) return;
        }
        if (value === '' || value === undefined || value === null) {
          urlSearchParam.delete(key);
        } else {
          urlSearchParam.set(key, String(value));
        }
      });
      setSearchParam(urlSearchParam);
    },
    [searchParam, options.resetOnSearch, options.validatePage],
  );

  return {
    searchParam,
    setSearchParam,
    handleParamsChange,
    queryParam,
  };
}
