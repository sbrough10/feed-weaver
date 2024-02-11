import { addStylesheet } from "app/utilities/styles";

export const { classes } = addStylesheet((theme) => ({
  post: {
    display: "flex",
    flexDirection: "row",
    fontSize: "16px",
    textAlign: "left",
    gap: "8px",
    margin: "8px",
    wordBreak: "break-word",
    "& img": {
      border: "solid #fff 1px",
      height: "100%",
    },
    "& p": {
      margin: "0px",
    },
    "& a": {
      color: "inherit",
      textDecoration: "none",
    },
  },
  actionColumn: {
    width: "50px",
    display: "flex",
    flexDirection: "column",
  },
  detailsColumn: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
  },
  postDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  postTitle: {
    fontSize: "20px",
  },
}));
