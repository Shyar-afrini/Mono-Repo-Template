export const getDirectionBasedStyles = async (
  dir: "rtl" | "ltr",
  rtlStyles: string,
  ltrStyles: string
) => {
  return dir === "ltr" ? ltrStyles : rtlStyles;
};
