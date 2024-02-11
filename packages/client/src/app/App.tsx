import React, { useState } from "react";
import { useUserPostList } from "./state";
import { PostSummary } from "./components/PostSummary";
import { Logo } from "./components/Logo";
import { classes } from "./App.styles";

export const App: React.FC = () => {
  const search = new URLSearchParams(window.location.search);
  const status = search.get("status");

  const postList = useUserPostList();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <a href="/">
          <Logo />
        </a>
        {/* <MenuToggle
          isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen((isMenuOpen) => !isMenuOpen)}
        /> */}
      </header>
      {isMenuOpen && (
        <menu className={classes.menu}>
          <a href="?status=read">Read Posts</a>
        </menu>
      )}
      <main>
        <div>
          {postList.map((post) => {
            return (
              <>
                <PostSummary isRead={status === "read"} data={post} />
                <hr style={{ margin: "8px" }} />
              </>
            );
          })}
        </div>
      </main>
    </div>
  );
};
