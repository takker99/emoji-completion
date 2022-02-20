/** @jsx h */
/** @jsxFrag Fragment */
/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { Fragment, h, render } from "./deps/preact.tsx";
import { editor, textInput } from "./deps/scrapbox-std.ts";
import { useKeyboard } from "./useKeyboard.ts";
import { useScrollIntoView } from "./useScrollIntoView.ts";
import { useCompletion } from "./useCompletion.ts";
import { CSS } from "./app.min.css.ts";

interface Props {
  projectIds: string[];
}
const App = ({ projectIds }: Props) => {
  const {
    item,
    list,
    confirmIcon,
    start,
    cancel, // 一時的に補完を止める
    isOpen,
    isEnableKeyboard,
    loading,
    searching,
    query,
    selectPrev,
    selectNext,
    position,
  } = useCompletion("emoji-completion", projectIds, {
    icon: true,
    filter: /^:/,
  });
  const ref = useScrollIntoView(item?.key);

  const textInput_ = textInput();
  if (!textInput_) {
    throw Error(`#text-input could not be found.`);
  }
  useKeyboard(textInput_, { key: "Tab", shiftKey: true }, selectPrev, {
    enable: isEnableKeyboard,
  }, [isEnableKeyboard]);
  useKeyboard(textInput_, { key: "Tab", shiftKey: false }, selectNext, {
    enable: isEnableKeyboard,
  }, [isEnableKeyboard]);
  useKeyboard(textInput_, "Enter", confirmIcon, { enable: isEnableKeyboard }, [
    isEnableKeyboard,
  ]);
  useKeyboard(textInput_, "Escape", cancel, { enable: isEnableKeyboard }, [
    isEnableKeyboard,
  ]);
  useKeyboard(textInput_, { key: " ", ctrlKey: true }, start, {
    stopPropagation: false,
  });

  return (
    <>
      <style>{CSS}</style>
      <ul
        ref={ref}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        hidden={!isOpen}
      >
        <li className="message">
          {loading
            ? "Loading..."
            : searching
            ? `Searching for "${query}"...`
            : "Ready to search."}
        </li>
        {list.map(({ key, href, onClick }) => (
          <li
            key={key}
            data-key={key}
            className={key === item?.key ? "selected" : ""}
          >
            <a href={href} key={key} tabIndex={-1} onClick={onClick}>
              <img src={`/api/pages${href}/icon`} />
              {key}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
};

export function mount(projects: string[]) {
  const app = document.createElement("div");
  app.dataset.userscriptName = "external-completion";
  editor()?.append?.(app);
  const shadowRoot = app.attachShadow({ mode: "open" });
  render(<App projectIds={projects} />, shadowRoot);
}
