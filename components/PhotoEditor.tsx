
import React, { useState, useRef } from 'react';
import { editProfessionalPhoto } from '../services/geminiService';

const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await editProfessionalPhoto(image, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">AI Headshot Enhancer</h2>
        <p className="text-gray-500 mt-2">Perfect your LinkedIn profile picture with AI-powered professional editing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
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
