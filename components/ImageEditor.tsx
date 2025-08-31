
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './Spinner';
import { Edit, Star, UploadCloud, RefreshCw, FileText } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';

interface ImageEditorProps {
  setActiveTab: (tab: Tab) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<{ data: string, url: string } | null>(null);
  const [editedText, setEditedText] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string, url: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({ data: base64Data, mimeType: file.type, url: result });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image size should not exceed 4MB.");
        return;
      }
       if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setError("Please upload a PNG or JPG image.");
        return;
      }
      handleStartOver(); // Clear previous state
      setImageFile(file);
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!imageBase64) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter an editing instruction.');
      return;
    }

    setLoading(true);
    setError(null);
    setEditedImage(null);
    setEditedText(null);

    try {
      const result = await editImage(imageBase64.data, imageBase64.mimeType, prompt);
      if (result.image) {
        const imageUrl = `data:${imageBase64.mimeType};base64,${result.image}`;
        setEditedImage({ data: result.image, url: imageUrl });
      }
      if (result.text) {
        setEditedText(result.text);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while editing the image.');
    } finally {
      setLoading(false);
    }
  }, [imageBase64, prompt]);

  const handleStartOver = () => {
    setError(null);
    setImageFile(null);
    setImageBase64(null);
    setPrompt('');
    setEditedImage(null);
    setEditedText(null);
  };

   if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Image Editor</h2>
        <p className="text-slate-400 mb-6 max-w-md">The AI Image Editor is a Pro feature. Upgrade your account to start creating.</p>
        <button
          onClick={() => setActiveTab(Tab.Pricing)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-in-up">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
            <Edit className="w-6 h-6 text-violet-400" /> AI Image Editor
        </h2>
        <p className="text-center text-slate-400 mb-6">Upload an image and tell the AI how to change it.</p>
        
        {!imageBase64 && (
             <div className="flex items-center justify-center w-full">
               <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-4 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG or JPG (MAX. 4MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                </label>
            </div>
        )}

        {imageBase64 && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-center text-slate-200">Original</h3>
                        <img src={imageBase64.url} alt="Original upload" className="rounded-lg w-full aspect-square object-contain bg-black/20"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-center text-slate-200">Edited</h3>
                        <div className="rounded-lg w-full aspect-square bg-black/20 flex items-center justify-center relative">
                            {loading && <Spinner size="lg" />}
                            {!loading && editedImage && <img src={editedImage.url} alt="Edited result" className="rounded-lg w-full aspect-square object-contain" />}
                             {!loading && !editedImage && <p className="text-slate-500">Your edited image will appear here</p>}
                        </div>
                    </div>
                </div>
                 {editedText && (
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-300 italic"><strong className="text-violet-300 not-italic">AI Note:</strong> {editedText}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                       <FileText className="w-5 h-5"/> Editing Instruction
                    </label>
                    <textarea
                        id="image-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'add a birthday hat on the cat', 'make the background a galaxy'"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none h-24 shadow-inner"
                        rows={3}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={handleStartOver}
                        className="w-full sm:w-auto flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                        title="Clear the current image and start over"
                    >
                       Start Over
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30"
                        title="Generate the edited image"
                    >
                        {loading ? <Spinner /> : <><RefreshCw className="w-5 h-5 mr-2" /> Generate</>}
                    </button>
                </div>
            </div>
        )}
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ImageEditor;