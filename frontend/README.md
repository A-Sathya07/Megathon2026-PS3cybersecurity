# RAGShield Admin Dashboard

A single-page React admin dashboard UI for RAGShield, built with Vite + React + Tailwind CSS + lucide-react.

## Run it in VS Code

1. Unzip this project and open the folder in VS Code.
2. Open a terminal (`` Ctrl+` `` / `` Cmd+` ``) and install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the URL it prints (usually `http://localhost:5173`) in your browser.

## Project structure

```
ragshield-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx      # React entry point
    ├── App.jsx        # The whole dashboard (layout + all sections)
    └── index.css      # Tailwind directives + base styles
```

## Notes

- Everything is static/mock data — no backend, auth, or real API calls, per the brief.
- The floating button bottom-right opens the RAG Assistant chat panel.
- Build for production with `npm run build`; preview that build with `npm run preview`.
