import { useEffect, useState } from "react";

const useDebounce = (query: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, query]);

  return debouncedValue;
};

export default useDebounce;
