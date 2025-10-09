import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Edit, Star, UploadCloud, RefreshCw, Download, Sliders, Trash2 } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';

interface ImageEditorProps {
  setActiveTab: (tab: Tab) => void;
}

const imageStyles = ['Default', 'Cinematic', 'Vintage Film', 'Anime', 'Documentary', 'Hyperlapse', 'Claymation', 'Black and White', 'Vibrant Colors'];

const ImageEditor: React.FC<ImageEditorProps> = ({ setActiveTab }) => {
  const { user, addContentToHistory } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<{ data: string, url: string } | null>(null);
  const [editedText, setEditedText] = useState<string | null>(null);
  
  // AI Toolkit State
  const [objectToRemove, setObjectToRemove] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0]);

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

    let finalPrompt = prompt;
    if (objectToRemove) {
        finalPrompt += ` Remove the ${objectToRemove}.`;
    }
    if (selectedStyle && selectedStyle !== 'Default') {
        finalPrompt += ` Apply a ${selectedStyle} style.`;
    }
    finalPrompt = finalPrompt.trim();
    
    if (!finalPrompt) {
      setError('Please enter an editing instruction or select a tool.');
      return;
    }

    setLoading(true);
    setError(null);
    setEditedImage(null);
    setEditedText(null);

    try {
      const result = await editImage(imageBase64.data, imageBase64.mimeType, finalPrompt);
      if (result.image) {
        const imageUrl = `data:${imageBase64.mimeType};base64,${result.image}`;
        setEditedImage({ data: result.image, url: imageUrl });
        addContentToHistory({
            type: 'Image Edit',
            summary: `Image edit: "${finalPrompt.substring(0, 30)}..."`,
            content: {
                originalImageUrl: imageBase64.url,
                editedImageBase64: result.image,
                mimeType: imageBase64.mimeType,
                prompt: finalPrompt,
                inputs: {
                    general: prompt,
                    remove: objectToRemove,
                    style: selectedStyle,
                },
                aiNote: result.text
            }
        });
      }
      if (result.text) {
        setEditedText(result.text);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while editing the image.');
    } finally {
      setLoading(false);
    }
  }, [imageBase64, prompt, objectToRemove, selectedStyle, addContentToHistory]);

  const handleClearToolkit = () => {
    setPrompt('');
    setObjectToRemove('');
    setSelectedStyle(imageStyles[0]);
  };

  const handleStartOver = () => {
    setError(null);
    setImageFile(null);
    setImageBase64(null);
    setEditedImage(null);
    setEditedText(null);
    handleClearToolkit();
  };
  
  const handleDownloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage.url;
    link.download = `utrend_edit_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
               <label htmlFor="dropzone-file" title="Upload the image you want to edit (PNG or JPG, max 4MB)" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
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
                 {/* AI Toolkit */}
                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2"><Sliders className="w-5 h-5 text-violet-400" /> AI Toolkit</h4>
                        <button onClick={handleClearToolkit} title="Reset all toolkit inputs to their default values" className="flex items-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                            <Trash2 className="w-3 h-3"/> Clear Toolkit
                        </button>
                    </div>
                    <div className="space-y-4">
                         <textarea
                            id="image-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder="General Instruction (e.g., 'add a birthday hat on the cat')"
                            className="form-input h-20" rows={2}
                            title="Describe the main change you want, e.g., 'add a birthday hat on the cat'"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="remove-object" className="block text-sm font-medium text-slate-300 mb-1">Remove Object</label>
                                <input id="remove-object" type="text" value={objectToRemove} onChange={(e) => setObjectToRemove(e.target.value)} placeholder="e.g., 'the person on the left'" className="form-input" title="Specify an object to remove from the image"/>
                            </div>
                            <div>
                                <label htmlFor="style-select" className="block text-sm font-medium text-slate-300 mb-1">Apply Style</label>
                                <select id="style-select" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="form-select" title="Apply a specific visual style to the entire image">
                                    {imageStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={handleDownloadImage}
                        disabled={!editedImage || loading}
                        className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                        title="Download the edited image"
                    >
                        <Download className="w-5 h-5 mr-2" /> Download
                    </button>
                    <button
                        onClick={handleStartOver}
                        className="w-full sm:w-auto flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                        title="Clear the current image and start a new edit"
                    >
                       Start Over
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        title="Apply your edits and generate a new image"
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