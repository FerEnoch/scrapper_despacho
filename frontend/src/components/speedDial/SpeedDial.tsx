import { useState } from "react";

interface SpeedDialProps {
  handleDownloadData: () => void;
}

export function SpeedDial({ handleDownloadData }: SpeedDialProps) {
  const [showButtons, setShowButtons] = useState(false);

  const handleMenuToggle = () => {
    setShowButtons((state) => !state);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      data-dial-init
      className="
      w-16
    fixed bottom-6 end-24 group
    flex flex-col items-center justify-center
    "
    >
      {showButtons && (
        <div
          id="speed-dial-menu-text-inside-button"
          className="flex flex-col items-center mb-4 space-y-2"
        >
          <button
            type="button"
            className="
            w-20 h-20 text-gray-500 bg-white rounded-full border border-gray-200 dark:border-gray-600 hover:text-gray-900 shadow-xs dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-1 
            focus:ring-green-300 focus:outline-none dark:focus:ring-gray-400
            "
            onClick={handleDownloadData}
          >
            <svg
              className="w-4 h-4 mx-auto mb-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
              <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
            <span className="block text-xs font-medium max-w-[6ch] mx-auto text-center">
              Guardar .csv
            </span>
          </button>
        </div>
      )}
      <div className="flex gap-4 self-end">
        <button
          type="button"
          data-dial-toggle="speed-dial-menu-text-inside-button"
          aria-controls="speed-dial-menu-text-inside-button"
          aria-expanded="false"
          onClick={handleScrollToTop}
          className="flex items-center justify-center text-green-900 bg-green-200 rounded-full w-14 h-14 hover:bg-green-300 focus:ring-4 focus:ring-green-300 focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M5 13V1m0 0L1 5m4-4 4 4"
            />
          </svg>
        </button>
        <button
          type="button"
          data-dial-toggle="speed-dial-menu-text-inside-button"
          aria-controls="speed-dial-menu-text-inside-button"
          aria-expanded="false"
          onClick={handleMenuToggle}
          className="flex items-center justify-center text-green-900 bg-green-200 rounded-full w-14 h-14 hover:bg-green-300 focus:ring-4 focus:ring-green-300 focus:outline-none"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:rotate-45"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span className="sr-only">Abrir menú</span>
        </button>
      </div>
    </div>
  );
}
