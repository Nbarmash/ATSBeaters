import React, { useState, useRef, useCallback } from 'react';
import { editProfessionalPhoto } from '../services/geminiService';

const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not access camera. Please try uploading a photo instead.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      setEditedImage(null);
      setError(null);
    }
    stopCamera();
  }, [stopCamera]);

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await editProfessionalPhoto(image, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError((() => {
        const msg = String(err?.message || err?.toString() || '');
        if (msg.includes('503') || msg.includes('loading') || msg.includes('currently loading')) return 'AI model is warming up, please wait 20 seconds and try again.';
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) return 'Too many requests. Please wait a moment and try again.';
        if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('API key')) return 'AI service configuration error. Please contact support.';
        if (msg.includes('No image returned')) return 'The AI did not return an edited image. Try a different prompt.';
        return 'AI image editing failed. Please try again.';
      })());
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadHeadshot = (ext: string) => {
    if (!editedImage) return;
    const a = document.createElement('a');
    a.href = editedImage;
    a.download = 'ATSBeaters_Headshot.' + ext;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">AI Headshot Enhancer</h2>
        <p className="text-gray-500 mt-2">Perfect your LinkedIn profile picture with AI-powered professional editing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {showCamera ? (
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl border-2 border-indigo-300 overflow-hidden bg-black flex items-center justify-center">
                {cameraError ? (
                  <div className="text-center p-6">
                    <i className="fas fa-camera-slash text-4xl text-red-400 mb-3"></i>
                    <p className="text-red-400 text-sm font-medium">{cameraError}</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                {!cameraError && (
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-camera"></i> Take Photo
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {image ? (
                  <>
                    <img src={image} alt="Original" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                ) : (
                  <div className="text-center p-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <i className="fas fa-user-circle text-5xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 font-medium">Click to upload headshot</p>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-upload"></i> Upload Photo
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-200"
                >
                  <i className="fas fa-camera"></i> Use Camera
                </button>
              </div>
            </>
          )}
          <p className="text-xs text-center text-gray-400">Original Photo</p>
        </div>

        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl border-2 border-indigo-100 flex items-center justify-center bg-indigo-50 overflow-hidden shadow-inner">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-600 font-medium">Reimagining your photo...</p>
              </div>
            ) : editedImage ? (
              <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8 text-indigo-300">
                <i className="fas fa-magic text-5xl mb-4"></i>
                <p className="font-medium">Edited result will appear here</p>
              </div>
            )}
          </div>
          <p className="text-xs text-center text-gray-400">AI Enhanced Result</p>
          {editedImage && (
            <div className="flex justify-center gap-2 mt-1">
              {['png', 'jpg', 'webp'].map((ext) => (
                <button
                  key={ext}
                  onClick={() => downloadHeadshot(ext)}
                  className="text-xs font-bold text-indigo-600 px-3 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95"
                >
                  {ext.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-wand-magic-sparkles absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"></i>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Add a professional office background', 'Apply a subtle retro filter', 'Improve lighting'"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={handleEdit}
            disabled={!image || !prompt || isProcessing}
            className={`px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center min-w-[160px] ${(!image || !prompt || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'}`}
          >
            {isProcessing ? 'Processing...' : 'Apply AI Edit'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <span className="text-xs text-gray-400 uppercase font-bold w-full text-center mb-2">Popular Commands</span>
          {['Corporate backdrop', 'Studio lighting', 'Warm aesthetic', 'Modern blur'].map(tag => (
            <button
              key={tag}
              onClick={() => setPrompt(tag)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-full text-xs transition-colors border border-transparent hover:border-indigo-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
