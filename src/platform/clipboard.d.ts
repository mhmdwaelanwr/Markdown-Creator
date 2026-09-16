declare const Clipboard: {
  setString: (text: string) => void | Promise<void>;
  getString: () => string | Promise<string>;
  hasString: () => boolean | Promise<boolean>;
};

export default Clipboard;

