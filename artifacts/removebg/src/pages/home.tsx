import { useState, useCallback, useRef, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { UploadCloud, Image as ImageIcon, Download, RefreshCw, X, Wand2, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AppState = "upload" | "processing" | "result";

interface ProcessingStats {
  stage: string;
  progress: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState<ProcessingStats>({ stage: "Preparing...", progress: 0 });
  const [customBgColor, setCustomBgColor] = useState<string>("transparent");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanupUrls = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [originalUrl, resultUrl]);

  const processImage = async (file: File) => {
    try {
      setAppState("processing");
      setStats({ stage: "Initializing model (may take a moment on first run)...", progress: 0 });
      
      cleanupUrls();
      
      const newOriginalUrl = URL.createObjectURL(file);
      setOriginalImage(file);
      setOriginalUrl(newOriginalUrl);

      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          let stageName = key;
          if (key.includes("fetch:model")) stageName = "Downloading AI Model...";
          if (key.includes("compute:inference")) stageName = "Removing background...";
          
          setStats({
            stage: stageName,
            progress: Math.round((current / total) * 100) || 0
          });
        }
      });

      const newResultUrl = URL.createObjectURL(blob);
      setResultUrl(newResultUrl);
      setAppState("result");
      setCustomBgColor("transparent");
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to process image. Please try again.");
      resetState();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidImage(file)) {
      processImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidImage(file)) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isValidImage = (file: File) => {
    return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  };

  const resetState = () => {
    setAppState("upload");
    setOriginalImage(null);
    cleanupUrls();
    setOriginalUrl(null);
    setResultUrl(null);
    setStats({ stage: "Preparing...", progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `clearcut-${originalImage?.name || "result.png"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    return () => cleanupUrls();
  }, [cleanupUrls]);

  const presetColors = [
    "transparent", "#ffffff", "#000000", 
    "#f87171", "#fb923c", "#fbbf24", "#fcd34d", 
    "#a3e635", "#4ade80", "#34d399", "#2dd4bf", 
    "#38bdf8", "#22d3ee", "#60a5fa", "#818cf8",
    "#a78bfa", "#c084fc", "#e879f9", "#f472b6", "#fb7185"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="h-16 flex items-center px-6 lg:px-12 border-b bg-card z-10 sticky top-0">
        <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-foreground">
          <Wand2 className="w-5 h-5 text-primary" />
          ClearCut
        </div>
        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-4 hidden sm:flex">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 100% Local</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Fast & Free</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
        <div className="w-full flex flex-col items-center">
          
          {appState === "upload" && (
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                  Drop the background. <br/><span className="text-primary">Keep the focus.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                  Instantly remove image backgrounds in your browser. No uploads, no accounts, totally free.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-out bg-card w-full flex flex-col items-center justify-center p-12 sm:p-20",
                  isDragging ? "border-primary bg-primary/5 scale-[1.02] shadow-xl" : "border-border hover:border-primary/50 hover:bg-accent/50 shadow-sm hover:shadow-md"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={cn("p-4 rounded-full bg-primary/10 text-primary mb-6 transition-transform duration-300", isDragging ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-1")}>
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Click or drop an image here</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center">Supports JPEG, PNG, WEBP</p>
                <Button size="lg" className="rounded-full pointer-events-none px-8">
                  Browse Files
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                />
              </div>
            </div>
          )}

          {appState === "processing" && (
            <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
              <div className="bg-card border rounded-3xl p-10 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
                
                {originalUrl && (
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse" />
                    <img src={originalUrl} alt="Processing" className="w-full h-full object-cover rounded-2xl shadow-sm opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-background/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm animate-spin-slow">
                        <RefreshCw className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-semibold mb-2 text-foreground">Processing Image</h2>
                <p className="text-sm text-muted-foreground mb-8 min-h-[1.5rem] font-medium">{stats.stage}</p>
                
                <div className="w-full space-y-2">
                  <Progress value={stats.progress} className="h-2.5 w-full bg-accent" />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{stats.progress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {appState === "result" && resultUrl && originalUrl && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex flex-col lg:flex-row items-start gap-8 w-full">
                
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Original</h3>
                  </div>
                  <div className="relative w-full aspect-square sm:aspect-video rounded-3xl overflow-hidden bg-muted border shadow-sm">
                    <img src={originalUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Wand2 className="w-4 h-4" /> Result
                    </h3>
                  </div>
                  <div 
                    className="relative w-full aspect-square sm:aspect-video rounded-3xl overflow-hidden border-2 border-primary/20 shadow-md transition-colors duration-300"
                    style={{ backgroundColor: customBgColor === "transparent" ? undefined : customBgColor }}
                  >
                    {customBgColor === "transparent" && <div className="absolute inset-0 bg-checkerboard opacity-60" />}
                    <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" />
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-card border rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Background Color</span>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setCustomBgColor(color)}
                          className={cn(
                            "w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            customBgColor === color && "ring-2 ring-primary ring-offset-2 scale-110",
                            color === "transparent" && "bg-checkerboard bg-[length:10px_10px]"
                          )}
                          style={color !== "transparent" ? { backgroundColor: color } : undefined}
                          title={color === "transparent" ? "Transparent" : color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button variant="outline" size="lg" onClick={resetState} className="flex-1 sm:flex-none rounded-xl">
                      <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                    <Button size="lg" onClick={downloadResult} className="flex-1 sm:flex-none rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                  
                </div>
              </div>
              
            </div>
          )}

        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Processing happens entirely on your device. Your images are never uploaded to any server.</p>
      </footer>
    </div>
  );
}