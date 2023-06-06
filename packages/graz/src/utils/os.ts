export const isMobile = () => {
  if (typeof window !== "undefined") {
    return Boolean(
      window.matchMedia("(pointer:coarse)").matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent),
    );
  }

  return false;
};

export const isAndroid = () => {
  return isMobile() && navigator.userAgent.toLowerCase().includes("android");
};

export const isIos = () => {
  return (
    isMobile() &&
    (navigator.userAgent.toLowerCase().includes("iphone") || navigator.userAgent.toLowerCase().includes("ipad"))
  );
};
