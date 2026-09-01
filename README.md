# 🏛️ Mostra d'Arte

> **The Agent-Native Digital Art Gallery powered by WebMCP**  
> *Where AI acts as the physical "Director of Attention" inside the browser.*

[![WebMCP Standard](https://img.shields.io/badge/WebMCP-W3C%20Draft-blue?style=flat-square&logo=googlechrome)](https://webmachinelearning.github.io/webmcp)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Mostra d'Arte** is an immersive digital art gallery designed from the ground up for the **WebMCP (Web Model Context Protocol)** standard.

Traditional web applications require humans to navigate complex menus, sliders, and buttons, while typical AI chatbots are isolated in a text box, unable to touch or actuate the visual experience.

**Mostra d'Arte changes this paradigm:**  
By exposing client-side JavaScript functions to the browser's AI agent via `document.modelContext.registerTool()`, the AI transitions from a passive conversationalist into an active **"Director of Attention"** — seamlessly controlling camera zoom, highlighting historical brushwork, adjusting dramatic museum lighting, and curating exhibitions in real time.

---

## ⚡ WebMCP Standard Implementation

Mostra d'Arte strictly adheres to the official **W3C WebMCP Specification** (`document.modelContext`), exposing four client-side tools directly into the browser's execution context:

```typescript
// Core WebMCP registration in Mostra d'Arte
document.modelContext.registerTool({
  name: "zoom_painting",
  description: "Directs the gallery visitor's viewport and camera zoom to focus on a specific coordinate on the canvas.",
  inputSchema: {
    type: "object",
    properties: {
      x: { type: "number", description: "X coordinate percentage (0=left, 50=center, 100=right)" },
      y: { type: "number", description: "Y coordinate percentage (0=top, 50=center, 100=bottom)" },
      zoom: { type: "number", description: "Magnification level between 1.5 and 8.0" },
      detail_name: { type: "string", description: "Name of the detail being inspected" },
    },
    required: ["x", "y", "zoom"],
  },
  execute: async ({ x, y, zoom, detail_name }) => {
    // Actuates React canvas viewport state in real time
    return `Camera focused on "${detail_name}" at {x: ${x}%, y: ${y}%} at ${zoom}x zoom.`;
  },
}, { signal: abortController.signal });
```

### 🛠️ Registered WebMCP Tools

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| **`zoom_painting`** | Physically steers the canvas viewport camera to focus on microscopic details, brushstrokes, and hidden symbols. | `x` (0-100), `y` (0-100), `zoom` (1.5-8.0), `detail_name` (string) |
| **`switch_masterpiece`** | Dynamically changes the active painting on the gallery wall across the collection. | `artwork_id` (`starry-night`, `mona-lisa`, `girl-pearl-earring`, `the-kiss`, etc.), `reason` (string) |
| **`reset_view`** | Restores the viewport zoom back to 1.0x to contemplate the complete framed artwork as a cohesive whole. | `note` (optional string) |
| **`toggle_spotlight`** | Actuates a dramatic museum vignette spotlight, darkening ambient surroundings for heightened visual focus. | `active` (boolean) |

---

## 🎨 Key Features

- **Dynamic Attention Steering:** Agents calculate spatial coordinates on the canvas and trigger silky-smooth spring camera zooms to microscopic details.
- **Masterpiece Salon Wall:** Interactive collection browser featuring canonical masterpieces (*Van Gogh, Leonardo da Vinci, Vermeer, Klimt, Botticelli, Hokusai, Michelangelo*).
- **Curated Focal Point Hotspots:** Interactive golden markers highlighting key art historical intersections (sfumato technique, impasto brushwork, celestial turbulence).
- **Radar Minimap & Golden Ratio Grid:** High-precision canvas telemetry with a live orientation minimap and composition overlay.
- **Synthetic Ambient Acoustics:** Web Audio API synthesizer modeling contemplative museum room reverberation.
- **Real-Time WebMCP Status Indicator:** Live in-UI telemetry badge displaying connection state with browser agents.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/mostra-darte.git
   cd mostra-darte
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```text
   http://localhost:3000
   ```

---

## 🧪 Testing with WebMCP (Judge Guide)

You can test the agent tools in two simple ways:

### Option A: Official Chrome Extension (Recommended)
1. Install the **[Model Context Tool Inspector Extension](https://chromewebstore.google.com/detail/gbpdfapgefenggkahomfgkhfehlcenpd?utm_source=item-share-cb)** from the Chrome Web Store.
2. Open **Mostra d'Arte** (`http://localhost:3000` or the live Vercel URL).
3. Open the extension side panel. You will see all **4 WebMCP tools** detected automatically.
4. Try this multi-step agentic prompt in the extension chat:
   > *"Exhibit the Mona Lisa, turn on the focused spotlight for dramatic atmosphere, and zoom in on her elusive smile."*
5. Watch the browser autonomously execute the 3-tool chain in real time!

### Option B: Native Chrome WebMCP Flag
1. In Google Chrome, navigate to `chrome://flags/#enable-webmcp-testing`.
2. Set the flag to **Enabled** and relaunch Chrome.
3. Open DevTools (`F12`) on the page and inspect tools directly via:
   ```javascript
   const tools = await document.modelContext.getTools();
   console.log(tools);
   ```

---

## 💻 Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Web Standard:** W3C WebMCP (`document.modelContext`)
- **Styling:** Vanilla CSS + Tailwind CSS v4
- **Animations:** Motion (`motion/react`)
- **Sound:** Web Audio API synthetic harmonics
- **Icons:** Lucide React

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
