import classNames from "classnames";
import { FC, useEffect, useRef, useState } from "react";
import { KeyCombination } from "../types/KeyCombination";

export const CommandInput: FC<{
  commands: KeyCombination[];
  onSelect: (command: KeyCombination) => void
}> = ({ commands, onSelect }) => {
  const textInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [showCommandsList, setShowCommandsList] = useState(false);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const filteredCommands = commands.filter(
    command => !text.trim() || command[1].includes(text.toLowerCase())
  );
  const selectCommand = (command: KeyCombination) => {
    setText('');
    setActiveCommandIndex(0);
    setShowCommandsList(false);
    onSelect(command);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Escape":
          setShowCommandsList(false);
          break;
        case "Slash":
          event.preventDefault();
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
          break;
      }
    };
    document.body.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.removeEventListener('keydown', onKeyDown);
    }
  }, []);
  return (
    <div className="CommandInput">
      <input
        aria-label={"Command input"}
        ref={textInputRef}
        onChange={(event) => {
          setText(event.target.value);
          setActiveCommandIndex(0);
        }}
        onFocus={() => {
          setShowCommandsList(true);
        }}
        onBlur={() => {
          setShowCommandsList(false);
        }}
        onKeyDown={(event) => {
          if (!showCommandsList) {
            setShowCommandsList(true);
          }
          if (event.code === "ArrowDown") {
            if (activeCommandIndex === commands.length - 1) {
              setActiveCommandIndex(0);
            } else {
              setActiveCommandIndex(activeCommandIndex + 1);
            }
          } else if (event.code === "ArrowUp") {
            if (activeCommandIndex === 0) {
              setActiveCommandIndex(commands.length - 1);
            } else {
              setActiveCommandIndex(activeCommandIndex - 1);
            }
          } else if (event.code === "Enter") {
            selectCommand(filteredCommands[activeCommandIndex]);
          }
        }}
        className={"CommandInput"}
        placeholder={"Type a command"}
        type={"text"}
        value={text}
      />
      {showCommandsList && (
        <div className={"Commands"}>
          {filteredCommands.map((command, index) => (
            <div
              onClick={(event) => { event.stopPropagation(); selectCommand(command); }}
              key={command[0]}
              className={classNames("CommandItem", {
                isActive: activeCommandIndex === index,
              })}
            >
              {command[1]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
