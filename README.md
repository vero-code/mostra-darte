# 🏛️ Mostra d'Arte

> **The Agent-Native Digital Art Gallery powered by WebMCP**  
> *Where AI acts as the physical "Director of Attention" inside the browser.*

[![WebMCP Standard](https://img.shields.io/badge/WebMCP-W3C%20Draft-blue?style=flat-square&logo=googlechrome)](https://webmachinelearning.github.io/webmcp)
[![Chrome Status](https://img.shields.io/badge/Chrome%20Status-5117755740913664-4285F4?style=flat-square&logo=googlechrome)](https://chromestatus.com/feature/5117755740913664)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Mostra d'Arte** is an immersive digital art gallery designed from the ground up for the **W3C WebMCP (Web Model Context Protocol)** standard.

Traditional web applications require humans to navigate complex menus, sliders, and coordinate inputs, while typical AI chatbots remain isolated in a disconnected chat box, unable to touch or actuate the visual experience.

**Mostra d'Arte inverts this paradigm:**  
By exposing client-side tools to browser AI agents via `document.modelContext.registerTool()`, the AI transitions from a passive conversationalist into an active **"Director of Attention"** — steering high-precision camera zooms, adjusting museum illumination, playing spatial room acoustics, opening curatorial research dossiers, and even issuing digital VIP admission passes in real time.

> 📐 **Looking for complete protocol specifications, sequence diagrams, and component models? Check out our comprehensive [System Architecture Specification (ARCHITECTURE.md)](ARCHITECTURE.md).**

---

## 🧭 Critical User Journeys (CUJ)

In accordance with Google Chrome's [WebMCP Architecture Guidelines](https://web.dev/articles/webmcp-developer-guide), Mostra d'Arte is built to power three distinct **Critical User Journeys (CUJ)**:

### 1. 🔍 Spatial Deep-Dive & Canvas Actuation (Art Connoisseur CUJ)
- **Goal:** The visitor wants to visually understand subtle symbolism, hidden details, and geometric composition without manually panning and pinching.
- **Verified Agent Prompt:** *"Exhibit the Mona Lisa, turn on the focused spotlight for dramatic atmosphere, and zoom in on her elusive smile."*
- **Agent Execution Chain:**  
  `switch_masterpiece({ artwork_id: "mona-lisa" })` ➔ `toggle_spotlight({ active: true })` ➔ `zoom_painting({ x: 50, y: 35, zoom: 3.5, detail_name: "Elusive Smile" })`.

### 2. 🏛️ Collection Filtration & Exhibition Curation (Curatorial CUJ)
- **Goal:** The visitor explores the canonical collection on the grand salon wall.
- **Verified Agent Prompt:** *"Show me the entire gallery collection on the salon wall"*
- **Agent Execution Chain:**  
  `open_salon_browser({ open: true })`.

### 3. 🎟️ Transactional VIP Exhibition Reservation (Service & Booking CUJ)
- **Goal:** The visitor wants to book real-world admission tickets through the agent conversation without filling out complex multi-page booking forms.
- **Verified Agent Prompt:** *"Book 2 VIP passes for Alice on tomorrow's evening session"*
- **Agent Execution Chain:**  
  `reserve_gallery_pass({ visitor_name: "Alice", tickets_count: 2, date: "Tomorrow", session: "Evening VIP & Nocturne" })` ➔ Generates official digital VIP pass modal with confirmation ID and QR verification on screen.

---

## 🛠️ Complete 11-Tool WebMCP Catalog

All 11 tools are registered in real time via `document.modelContext.registerTool()` with cooperative cancellation (`AbortSignal`):

| # | Tool Name | Description | Annotations | Key Parameters |
|:---|:---|:---|:---|:---|
| **1** | **`zoom_painting`** | Physically directs canvas camera to focus on microscopic details and brushstrokes. | `readOnlyHint: true` | `x` (0-100), `y` (0-100), `zoom` (1.5-8.0), `detail_name` |
| **2** | **`switch_masterpiece`** | Dynamically changes the exhibited artwork on the gallery wall. | `readOnlyHint: true` | `artwork_id` (`starry-night`, `mona-lisa`, etc.), `reason` |
| **3** | **`reset_view`** | Restores canvas zoom back to 1.0x wide perspective. | `readOnlyHint: true` | `note` (optional string) |
| **4** | **`toggle_spotlight`** | Actuates dramatic museum vignette spotlight beam for heightened focus. | `readOnlyHint: true` | `active` (boolean) |
| **5** | **`get_artwork_details`** | Retrieves provenance, color palette symbolism, and curated hotspot coordinates. | `readOnlyHint: true` | `artwork_id` (optional string) |
| **6** | **`start_guided_tour`** | Launches autonomous thematic tour with audio narration and camera waypoints. | `readOnlyHint: true` | `tour_id` (optional string) |
| **7** | **`toggle_curatorial_dossier`** | Opens slide-out research drawer, optionally switching to `palette`, `overview`, or `tours`. | `readOnlyHint: true` | `open` (boolean), `tab` (`overview`, `palette`, `focal`, `tours`) |
| **8** | **`toggle_ambient_acoustics`** | Starts or mutes spatial museum room reverberation synthesized via Web Audio API. | `readOnlyHint: true` | `active` (boolean) |
| **9** | **`reserve_gallery_pass`** | **Transactional:** Issues confirmed VIP exhibition pass with reservation ID and QR badge. | *(Action)* | `visitor_name`, `date`, `tickets_count`, `session` |
| **10** | **`toggle_composition_grid`** | Overlays or hides the Golden Ratio dynamic geometric analysis grid on the canvas. | `readOnlyHint: true` | `active` (boolean) |
| **11** | **`open_salon_browser`** | Opens the architectural Salon Wall browser with period filtering (`Dutch Golden Age`, etc.) and search. | `readOnlyHint: true` | `open` (boolean), `period` (string), `search` (string) |

---

## 🏛️ Architectural Alignment with W3C WebMCP Draft

Mostra d'Arte strictly adheres to the **[W3C Web Machine Learning Working Draft](https://webmachinelearning.github.io/webmcp)** and Chromium Origin Trial specifications:

1. **Imperative JavaScript API Architecture (§ 4.2):**  
   Mostra d'Arte adopts the **Imperative WebMCP API** (`document.modelContext.registerTool`) rather than the declarative HTML form attribute approach (`<form toolname>`). Because our digital gallery actuates real-time canvas spring physics, Web Audio harmonic synthesis, and stateful React camera viewports, the imperative API grants direct programmatic actuation, JSON Schema validation, and bidirectional feedback with the browser agent.

2. **Multimodal Vision via Annotated Page Content (APC) (§ 5.2):**  
   Chromium agents do not rely solely on DOM trees; they take real-time visual observations (APC snapshots) of the canvas. Mostra d'Arte connects this visual cortex with physical tool execution — the agent visually perceives details on canvas and translates them into precise viewport coordinates via `zoom_painting`.
   
3. **Dynamic Tool Registry via `getTools()` & `toolchange` (§ 4.4):**  
   The UI subscribes to native `document.modelContext.addEventListener("toolchange", ...)` events and queries active tools dynamically via `document.modelContext.getTools()`, updating the telemetry badge without hardcoded lists.

4. **Security Intent Declarations (`readOnlyHint`) (§ 4.2.1):**  
   Exploratory tools declare `annotations: { readOnlyHint: true }` to eliminate confirmation friction, while transactional tools like `reserve_gallery_pass` execute real-world booking flows.

5. **Cooperative Cancellation (`AbortSignal`) (§ 3.1):**  
   All tool execution callbacks honor `{ signal: AbortSignal }`, immediately aborting active camera springs or network requests if the user changes commands.

6. **Initial State Awareness & Contextual Binding (Google Framework):**  
   Adhering to Google's *"Define the Initial State"* guideline, tools are architected with full awareness of the user's active viewport and screen context (`currentArtworkRef.current`). Calling `get_artwork_details({})` without parameters immediately returns deep context on the painting currently mounted on the wall, `start_guided_tour()` automatically narrates the exhibited masterpiece, and `reserve_gallery_pass()` binds the active exhibition title to the confirmed pass. The agent never operates in the dark.

7. **Graceful Error Recovery & Natural Language Variance Tolerance:**  
   Adhering to Google Chrome's WebMCP architectural guidelines (*"Fail gracefully and enable recovery"* & *"Address variance"*), tools never terminate in raw protocol crashes (`throw Error`). Instead, they return actionable context-aware guidance (e.g., suggesting all canonical masterpiece IDs if an unrecognized painting is queried). Furthermore, tools absorb conversational variance through tab synonym mapping (`"colors"` / `"pigments"` ➔ `"palette"`), fuzzy movement matching (`"Dutch"` ➔ `"Dutch Golden Age"`), default fallback parameters, and defensive mathematical sanitization guarding against `NaN` coordinates.

---

## 🧪 Testing with WebMCP (Judge Guide)

You can test the agent tools in two simple steps:

### Step 1: Enable WebMCP in Chrome
1. In Google Chrome, navigate to `chrome://flags/#enable-webmcp-testing`.
2. Set the flag to **Enabled** and relaunch Chrome.
*(Official Origin Trial ID: `4163014905550602241`)*

### Step 2: Test via Model Context Tool Inspector Extension
1. Install the official **[Model Context Tool Inspector Extension](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd)** from the Chrome Web Store.
2. Open **Mostra d'Arte** in Chrome.
3. Open the extension side panel — you will immediately see all **11 WebMCP tools** detected automatically.
4. Try these verified agent prompts covering all 11 tools:

| # | Target WebMCP Tool | Verified Agent Prompt | Expected UI Actuation |
|:---|:---|:---|:---|
| 1️⃣ | **`zoom_painting`** | *"Show me the details of the moon in this painting"* | Camera glides and magnifies canvas details |
| 2️⃣ | **`switch_masterpiece`** | *"Show me Mona Lisa"* | Wall exhibition mounts the requested masterpiece |
| 3️⃣ | **`reset_view`** | *"Zoom in on the smile, then reset the view to see the whole painting"* | Zooms into detail, then smoothly restores 1.0x wide canvas |
| 4️⃣ | **`toggle_spotlight`** | *"Zoom in on the moon and turn on the spotlight to highlight the painting."*<br/>*"Exhibit the Mona Lisa, turn on the focused spotlight for dramatic atmosphere, and zoom in on her elusive smile."* | Radial vignette darkens surroundings for museum atmosphere |
| 5️⃣ | **`get_artwork_details`** | *"Tell me the historical background and key focal points of this painting, then zoom in on the most symbolic detail."* | Retrieves provenance & archives, then steers camera |
| 6️⃣ | **`start_guided_tour`** | *"Please start a guided tour of this painting"* | Launches autonomous waypoint tour with voice narration |
| 7️⃣ | **`toggle_curatorial_dossier`** | *"What pigments and colors did Van Gogh use for this sky? Show me the palette."*<br/>*"Show me the color palette and pigments used in this masterpiece"*<br/>*"Close the dossier and return to full canvas"* | Slides out research drawer on Palette; closes on command |
| 8️⃣ | **`toggle_ambient_acoustics`** | *"Turn on the gallery ambient music to set a contemplative mood."*<br/>*"Mute the gallery ambient sound."* | Web Audio synthesizer starts or mutes gallery acoustics |
| 9️⃣ | **`reserve_gallery_pass`** | *"Book 2 VIP passes for Alice on tomorrow's evening session"* | Generates verified digital VIP pass modal with QR badge |
| 🔟 | **`toggle_composition_grid`** | *"Analyze the geometric balance of this painting and show the composition grid."*<br/>*"Hide the composition grid."* | Displays or hides Golden Ratio dynamic geometric overlay |
| 1️⃣1️⃣ | **`open_salon_browser`** | *"Show me the entire gallery collection on the salon wall"* | Opens architectural full-screen salon gallery collection |

---

## 💻 Tech Stack

- **Web Standard:** W3C WebMCP (Imperative JS API via `document.modelContext` + `webmcp-types`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Vanilla CSS + Tailwind CSS v4
- **Animations:** Motion (`motion/react`)
- **Sound:** Web Audio API harmonic chord synthesizer
- **Speech:** Web Speech API (`SpeechSynthesis`) docent narration
- **Icons:** Lucide React

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
