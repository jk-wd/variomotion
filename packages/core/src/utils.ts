import { IValueStore } from "./types-interfaces";

export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function generateShortUID() {
  let firstPart: string | number = (Math.random() * 46656) | 0;
  let secondPart: string | number = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

export const getValueStoreValue = (
  valueStore: IValueStore,
  key?: string,
  fallbackValue?: number
): number => {
  if (!key) {
    return fallbackValue ?? 0;
  }
  if (valueStore[key] && typeof valueStore[key] === "function") {
    const item = valueStore[key] as () => number;
    return item();
  }
  return (valueStore[key] ?? fallbackValue) as number;
};

export const numberIsSet = (value?: number): boolean => {
  if (value === 0) {
    return true;
  }
  return !!value;
};

export const calculatePageScroll = (startPos: number = 0) => {
  const documentElement = document.documentElement || document.body;
  const scrollHeight = documentElement.scrollHeight;
  const scrollOffset = window.pageYOffset || documentElement.scrollTop;
  const scrollOffsetMinStart = Math.max(scrollOffset - startPos, 0);
  const percentage =
    scrollOffsetMinStart / (scrollHeight - documentElement.clientHeight);
  const scrollPercentage = Math.min(Math.max(percentage, 0), 1) * 100;

  return {
    scrollOffset: scrollOffsetMinStart,
    scrollPercentage,
  };
};
