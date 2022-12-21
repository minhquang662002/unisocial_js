import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "../redux/app/store";

export const useClickOutside = (ref: any, handler: any) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const useDebounce = (value: any, delay: any) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.theme === "dark"
  );
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  useEffect(() => {
    const html = window.document.documentElement;
    const prevTheme = isDarkMode ? "light" : "dark";
    html.classList.remove(prevTheme);
    const nextTheme = isDarkMode ? "dark" : "light";
    html.classList.add(nextTheme);
    localStorage.setItem("theme", nextTheme);
  }, [isDarkMode]);
  return [toggleDarkMode];
};

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
