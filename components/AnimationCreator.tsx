import React, { useState, useRef, useEffect } from 'react';
import { generateAnimation, checkVideoStatus } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, Clapperboard, RefreshCw, Download } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';

const loadingMessages = [
    "Warming up the animation studio...",
    "This can take a few minutes, please wait...",
    "Drawing frames and adding color...",
    "Rendering your animation sequence...",
    "Still working... high-quality animation takes time!",
];

const animationStyles = ['2D Cartoon', '3D Render', 'Claymation', 'Anime Style', 'Stop Motion'];

const animationTemplates: { name: string; prompt: string; }[] = [
  { name: 'Select a Template...', prompt: '' },
  { name: 'Explainer Video', prompt: 'A simple, animated explainer video about [YOUR TOPIC] using clean graphics and on-screen text.' },
  { name: 'Logo Reveal', prompt: 'A dynamic logo reveal for a brand named [BRAND NAME]. It should feature particles and light effects.' },
  { name: 'Character Action', prompt: 'A character animation of a [CHARACTER DESCRIPTION] performing a [SPECIFIC ACTION].' },
  { name: 'Abstract Loop', prompt: 'A seamlessly looping abstract animation with geometric shapes morphing and changing colors.' },
  { name: 'Product Demo', prompt: 'An animated showcase of a [PRODUCT], highlighting its key features with callouts.'},
];


interface AnimationCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

const AnimationCreator: React.FC<AnimationCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [animationStyle, setAnimationStyle] = useState(animationStyles[0]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [animationUrl, setAnimationUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(animationTemplates[0].name);
    
    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const cleanupIntervals = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
    }

    useEffect(() => {
         return () => cleanupIntervals(); // Cleanup on unmount
    }, []);

    const pollOperationStatus = (op: any) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);

                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setLoadingMessage("Fetching your animation...");
                        // FIX: Per @google/genai guidelines, the API key must be from process.env.API_KEY.
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const videoBlob = await response.blob();
