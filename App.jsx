import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  Zap,
  Maximize2,
  Shirt,
  RefreshCcw,
  Send,
  MousePointer2
} from 'lucide-react';

const App = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('remove'); 
  const [outfitPrompt, setOutfitPrompt] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const apiKey = "";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAI = async (mode, customPrompt = "") => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setActiveTab(mode);

    try {
      const base64Data = image.split(',')[1];
      let prompt = "";
      
      if (mode === 'remove') {
        prompt = "Remove the background completely and provide only the main subject on a transparent background.";
      } else if (mode === 'enhance') {
        prompt = "Enhance this image to 4K quality. Sharpen details and upscale it.";
      } else if (mode === 'outfit') {
        prompt = `Change the person's clothes to: ${customPrompt || 'a professional outfit'}. Keep everything else same.`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: base64Data } }
            ]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      });

      if (!response.ok) throw new Error("AI process nahi ho paya.");

      const result = await response.json();
      const base64Image = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (base64Image) {
        setProcessedImage(`data:image/png;base64,${base64Image}`);
      } else {
        throw new Error("AI ne image return nahi ki.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gallery mein save karne ke liye download function
  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `AI_Magic_${activeTab}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 bg-zinc-900/80 p-5 rounded-[2rem] border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight italic">PHOTO GENIE <span className="text-blue-400">PRO</span></h1>
          </div>
          {image && (
            <button onClick={() => { setImage(null); setProcessedImage(null); }} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all">
              <RefreshCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {!image ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="w-full max-w-xl mx-auto aspect-square border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-zinc-900/30 group"
          >
            <div className="p-8 bg-zinc-800 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Photo Upload Karein</h2>
            <p className="text-zinc-500 mt-2">Gallery se image select karein</p>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl">
                <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-6 uppercase">AI Tools</p>
                
                <div className="space-y-3">
                  <button onClick={() => processAI('remove')} className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all border ${activeTab === 'remove' ? 'bg-blue-600 border-blue-400' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750'}`}>
                    <ImageIcon className="w-5 h-5" /> BG Remover
                  </button>
                  
                  <button onClick={() => processAI('enhance')} className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all border ${activeTab === 'enhance' ? 'bg-blue-600 border-blue-400' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750'}`}>
                    <Maximize2 className="w-5 h-5" /> 4K Enhance
                  </button>

                  <div className={`p-5 rounded-2xl border ${activeTab === 'outfit' ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-800'}`}>
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                      <Shirt className="w-5 h-5" />
                      <span className="font-bold text-sm">Outfit Changer</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Red Jacket, Suit..." 
                        value={outfitPrompt}
                        onChange={(e) => setOutfitPrompt(e.target.value)}
                        className="bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-sm w-full focus:border-purple-500 outline-none transition-all"
                      />
                      <button onClick={() => processAI('outfit', outfitPrompt)} disabled={loading} className="p-3 bg-purple-600 rounded-xl hover:bg-purple-500">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {error && <p className="mt-4 text-xs text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/20">{error}</p>}
              </div>

              {processedImage && (
                <button onClick={downloadImage} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                  <Download className="w-5 h-5" /> Save to Gallery
                </button>
              )}
            </div>

            {/* Display Area */}
            <div className="lg:col-span-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-3 md:p-6 min-h-[500px] relative flex flex-col shadow-inner">
                
                {loading && (
                  <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center">
                    <Loader2 className="w-14 h-14 text-blue-500 animate-spin" />
                    <p className="mt-6 font-bold text-blue-400 text-sm tracking-[0.3em] uppercase animate-pulse">Processing Magic...</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {/* Original Side */}
                  <div className="bg-black/40 rounded-[2rem] border border-zinc-800/50 p-4 flex flex-col items-center justify-center relative group">
                    <span className="absolute top-4 left-4 text-[9px] font-black text-zinc-600 tracking-tighter uppercase">Original</span>
                    <img src={image} className="max-w-full max-h-[350px] object-contain rounded-xl shadow-2xl" alt="Original" />
                  </div>

                  {/* AI Result Side */}
                  <div className="bg-black/60 rounded-[2rem] border border-blue-500/20 p-4 flex flex-col items-center justify-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]">
                    <span className="absolute top-4 left-4 text-[9px] font-black text-blue-400 tracking-tighter uppercase">AI Result</span>
                    
                    {processedImage ? (
                      <div className="relative group cursor-pointer" onClick={downloadImage}>
                        <img 
                          src={processedImage} 
                          className="max-w-full max-h-[350px] object-contain rounded-xl animate-in fade-in zoom-in duration-700 hover:opacity-90 transition-opacity" 
                          alt="Result" 
                        />
                        <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                           <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl">
                              <MousePointer2 className="w-4 h-4" /> Click to Download
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-800 flex flex-col items-center p-12">
                        <Sparkles className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-xs italic opacity-20 text-center uppercase tracking-widest">Select a magic tool above</p>
                      </div>
                    )}
                  </div>
                </div>

                {processedImage && (
                  <div className="mt-4 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2">
                      <MousePointer2 className="w-3 h-3" /> Tip: Photo par click karke bhi save kar sakte hain
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default App;

