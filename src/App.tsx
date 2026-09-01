import { GalleryHeader } from './components/GalleryHeader';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 antialiased font-sans">
      {/* Top Gallery Navigation Bar */}
      <GalleryHeader />
    </div>
  )
}

export default App
