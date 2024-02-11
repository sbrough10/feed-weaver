import { addStylesheet } from "app/utilities/styles";

export const { classes } = addStylesheet((theme) => ({
  root: {
    textAlign: "center",
    backgroundColor: "#282c34",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontSize: "calc(10px + 2vmin)",
    color: "white",
  },
  header: {
    display: "flex",
    height: "40px",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: "8px",
  },
  menu: {
    "& a": {
      textDecoration: "none",
      color: "white",
    },
  },
}));
