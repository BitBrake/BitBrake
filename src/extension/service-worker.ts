declare const chrome: {
  runtime: {
    onInstalled: {
      addListener(callback: () => void): void;
    };
  };
  sidePanel?: {
    setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
  };
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true });
});
