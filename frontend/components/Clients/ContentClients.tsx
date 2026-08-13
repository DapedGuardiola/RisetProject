"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserType } from "../Types/UserType";
import { CommentType } from "../Types/CommentType";
type ContentContextType = {
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  activeComment: boolean,
  setActiveComment: (state: boolean) => void,
  isLoading: boolean,
  setIsLoading: (state: boolean) => void,
  addComment: string,
  setAddComment: (value: string) => void,
  // commentList: CommentType[],
  // setCommentList: (item:CommentType[]) => void
}
const ContentContext = createContext<ContentContextType | undefined>(undefined);

export default function ContentClients({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeComment, setActiveComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addComment, setAddComment] = useState("");
  // const [commentList, setCommentList];
  return (
    <ContentContext.Provider value={{ activeIndex, setActiveIndex, activeComment, setActiveComment, isLoading, setIsLoading, addComment, setAddComment }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentContext() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
