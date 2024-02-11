import { Theme, createTheme } from "@mui/material";
import jss, { Styles } from "jss";
import jssCamelCasePlugin from "jss-plugin-camel-case";
import jssNestedPlugin from "jss-plugin-nested";

jss.setup({
  plugins: [jssNestedPlugin(), jssCamelCasePlugin()],
});

const theme = createTheme();

export const BP = {
  xs: 360,
  sm: 480,
  md: 720,
};

export const addStylesheet = <N extends string>(
  styles: Styles<N> | ((theme: Theme) => Styles<N>)
) => {
  const styleObj = styles instanceof Function ? styles(theme) : styles;
  return jss.createStyleSheet(styleObj).attach();
};
