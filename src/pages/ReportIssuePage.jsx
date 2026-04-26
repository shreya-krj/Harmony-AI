import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, Send, ShieldAlert, Activity, CheckCircle2, Mic, MicOff, BarChart2, Camera, MapPin, Image as ImageIcon, Video, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { analyzeIncidentText } from '../lib/incidentIntelligence';
import { useLanguage } from '../context/LanguageContext';

const BENGALURU_LOCATION_OPTIONS = [
  'KR Market',
  'Majestic Bus Stand',
  'Kempegowda Metro Station',
  'MG Road',
  'Brigade Road',
  'Indiranagar 100 Feet Road',
  'Koramangala 5th Block',
  'HSR Layout Sector 2',
  'Marathahalli Junction',
  'Whitefield Main Road',
  'Electronic City Phase 1',
  'Silk Board Junction',
  'Hebbal Flyover',
  'Yeshwanthpur Circle',
  'Jayanagar 4th Block',
  'Banashankari Bus Stand',
  'Kengeri Satellite Town',
  'Bellandur Lake Road',
  'Banaswadi Main Road',
  'Shivajinagar Bus Stand'
];

const CAMERA_LOCATION_OPTIONS = [
  'Near Captured Spot',
  'Roadside / Main Junction',
  'Metro Station Entrance',
  'Bus Stand Platform',
  'Market Area',
  'Apartment / Residential Lane',
  'School / College Gate',
  'Flyover / Underpass',
  'Parking Area',
  'Public Park'
];

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const levenshteinDistance = (a = '', b = '') => {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
};

const getRankedLocationSuggestions = (query, options) => {
  const q = normalize(query);
  if (!q) return options.slice(0, 6);

  return options
    .map((option) => {
      const opt = normalize(option);
      const startsWithScore = opt.startsWith(q) ? 25 : 0;
      const includesScore = opt.includes(q) ? 12 : 0;
      const distance = levenshteinDistance(q, opt.slice(0, Math.max(q.length, 3)));
      const typoScore = Math.max(0, 15 - distance * 3);
      return { option, score: startsWithScore + includesScore + typoScore };
    })
    .sort((a, b) => b.score - a.score)
    .filter((entry) => entry.score > 0)
    .slice(0, 6)
    .map((entry) => entry.option);
};

export function ReportIssuePage() {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [volume, setVolume] = useState(0);
  const [evidenceLocationLabel, setEvidenceLocationLabel] = useState('');
  const [showManualLocationSuggestions, setShowManualLocationSuggestions] = useState(false);
  const [showEvidenceLocationSuggestions, setShowEvidenceLocationSuggestions] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Refs to prevent stale closures in Speech API
  const descriptionRef = useRef(description);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  useEffect(() => {
    isListeningRef.current = isListening;
    if (recognitionRef.current) {
      if (isListening) {
        try { recognitionRef.current.start(); } catch (e) {}
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);
  // Camera & Evidence state
  const [evidenceUrl, setEvidenceUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [evidenceTimestamp, setEvidenceTimestamp] = useState(null);

  const { addReport } = useReports();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const userId = currentUser?.uid || 'user_1';

  useEffect(() => {
    // Setup Volume Meter
    let audioStream;
    const startVolumeMeter = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true
          } 
        });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!isListening) {
            setVolume(0);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i=0; i<bufferLength; i++) sum += dataArray[i];
          const average = sum / bufferLength;
          setVolume(average);
          requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (err) {
        console.error("Volume meter failed:", err);
      }
    };

    if (isListening) startVolumeMeter();
    
    return () => {
      if (audioStream) audioStream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isListening]);

  useEffect(() => {
    // Auto-capture location on mount
    autoCaptureLocation();
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    let sessionBaseText = '';

    recognitionRef.current.onstart = () => {
      // Snapshot the text right before we start listening
      sessionBaseText = descriptionRef.current;
    };
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      // Combine base text with the live rolling transcript cleanly
      setDescription((sessionBaseText + ' ' + currentTranscript).trim());
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      // Aggressive persistence: if they are still supposed to be listening, restart instantly
      if (isListeningRef.current) {
        sessionBaseText = descriptionRef.current;
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Restart failed, retrying...");
        }
      } else {
        // Only run analysis when they explicitly stop listening
        if (descriptionRef.current.length > 5) {
          handleSimulateAnalysis(descriptionRef.current);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopCamera();
    };
  }, []); // Run ONCE on mount

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setEvidenceUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setEvidenceUrl(dataUrl);
      setEvidenceTimestamp(new Date().toISOString());
      stopCamera();
      
      // Auto capture location for evidence independently
      autoCaptureLocation('evidence');
    }
  };

  const handleAttachPhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAttachPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEvidenceUrl(reader.result);
      setEvidenceTimestamp(new Date().toISOString());
      setIsCameraOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const manualLocationSuggestions = getRankedLocationSuggestions(locationLabel, BENGALURU_LOCATION_OPTIONS);
  const evidenceLocationSuggestions = getRankedLocationSuggestions(
    evidenceLocationLabel,
    [...CAMERA_LOCATION_OPTIONS, ...BENGALURU_LOCATION_OPTIONS]
  );

  const autoCaptureLocation = (target = 'manual') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          
          try {
            // Set a temporary loading state or coordinates first
            if (target === 'manual') setLocationLabel('Fetching location details...');
            if (target === 'evidence') setEvidenceLocationLabel('Fetching location details...');
            
            // Use OpenStreetMap Nominatim API for free reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            if (data && data.address) {
              // Build a friendly location string
              const { road, suburb, neighbourhood, city, town, village } = data.address;
              const localArea = road || neighbourhood || suburb || "";
              const cityArea = city || town || village || "";
              
              let friendlyAddress = [localArea, cityArea].filter(Boolean).join(", ");
              if (!friendlyAddress) friendlyAddress = data.display_name.split(',').slice(0, 2).join(',');
              
              const resolved = friendlyAddress.trim() || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              if (target === 'manual') setLocationLabel(resolved);
              if (target === 'evidence') setEvidenceLocationLabel(resolved);
            } else {
              const fallback = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              if (target === 'manual') setLocationLabel(fallback);
              if (target === 'evidence') setEvidenceLocationLabel(fallback);
            }
          } catch (error) {
            console.error("Error reverse geocoding location", error);
            const fallback = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            if (target === 'manual') setLocationLabel(fallback);
            if (target === 'evidence') setEvidenceLocationLabel(fallback);
          }
        },
        (error) => {
          console.error("Error auto-capturing location", error);
        }
      );
    }
  };

  const handleRealAnalysis = async (textToAnalyze = description) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 5) {
      setAiAnalysis(null);
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = analyzeIncidentText(textToAnalyze);
      setAiAnalysis(result);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis({
        priority: 'Low',
        category: 'Public Disorder',
        department: 'Police',
        confidence: '70%',
        escalationLikelihood: 'Fallback safety logic applied.',
        keywords: ['safety'],
        wordAnalysis: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add this helper for the voice end trigger
  const handleSimulateAnalysis = handleRealAnalysis;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalCategory = aiAnalysis?.category || 'General';
    const finalPriority = aiAnalysis?.priority || 'Low';
    const finalDepartment = aiAnalysis?.department || 'General Review';

    if (!locationLabel && !evidenceUrl) {
      alert("Please specify the area name or capture a photo.");
      return;
    }

    const reportData = {
      userId,
      title,
      description,
      location_label: locationLabel,
      evidence_location_label: evidenceLocationLabel || locationLabel,
      category: finalCategory,
      priority: finalPriority,
      department: finalDepartment,
      status: 'pending',
      evidenceUrl,
      location, // GPS Coordinates
      evidenceTimestamp: new Date().toISOString(),
    };

    try {
      // Send to backend via ReportContext
      await addReport(reportData);

      alert('Report submitted successfully with verified location! 📍');
      navigate('/dashboard');
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {t('reportAnIncident', 'Report an Incident')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Your safety report is completely anonymous. Our AI will analyze the risk and suggest next steps to peacebuilders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t('incidentDetails', 'Incident Details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Incident Area / Location Name</label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. North Metro Station, Central Park" 
                    required 
                    value={locationLabel}
                    onFocus={() => setShowManualLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowManualLocationSuggestions(false), 120)}
                    onChange={(e) => setLocationLabel(e.target.value)}
                  />
                  {showManualLocationSuggestions && manualLocationSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-900 shadow-xl max-h-44 overflow-y-auto">
                      {manualLocationSuggestions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onMouseDown={() => {
                            setLocationLabel(option);
                            setShowManualLocationSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Start typing and choose the closest area even if spelling is slightly incorrect.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <Input 
                  placeholder="e.g. Suspicious activity near the park" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              {/* VOICE COMMAND CENTER */}
              {speechSupported && (
                <div className="p-6 rounded-3xl bg-dark-800/50 border border-white/5 space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sentiment Analysis: Report the incident through voice</h3>
                      <p className="text-xs text-slate-500">Click below to speak your report clearly</p>
                    </div>
                    {isListening && (
                      <div className="flex gap-1.5 items-center h-8">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-1.5 rounded-full bg-primary-400 transition-all duration-75" 
                            style={{ 
                              height: `${Math.max(4, (volume * (1 + i * 0.2)) % 32)}px`,
                              opacity: 0.4 + (volume / 50)
                            }} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "gradient"}
                    className={cn(
                      "w-full h-16 text-lg font-black tracking-tighter gap-3 rounded-2xl transition-all duration-300",
                      isListening ? "animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "shadow-xl shadow-primary-500/20"
                    )}
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-6 h-6" /> STOP RECORDING NOW
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" /> START VOICE RECORDING
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  {isAnalyzing && !isListening && (
                    <span className="text-xs font-medium text-accent-green animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
                      AI Analyzing Sentence...
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <Textarea 
                    placeholder="Describe what happened, where it occurred, and any other relevant details..." 
                    required 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleRealAnalysis(description)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              {/* In-App Camera Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Evidence</label>
                  {!isCameraOpen && !evidenceUrl && (
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={startCamera}
                        className="gap-2 text-xs h-9 border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
                      >
                        <Camera className="w-4 h-4" />
                        Capture Evidence
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAttachPhotoClick}
                        className="gap-2 text-xs h-9 border-accent-green/30 text-accent-green hover:bg-accent-green/10"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Attach Photo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAttachPhoto}
                      />
                    </div>
                  )}
                </div>

                {isCameraOpen && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => videoRef.current.play()}
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full w-12 h-12"
                        onClick={stopCamera}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="gradient" 
                        size="icon" 
                        className="rounded-full w-12 h-12 shadow-[0_0_15px_rgba(255,255,255,0.3)] border-2 border-white"
                        onClick={capturePhoto}
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {evidenceUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-dark-900 group">
                    <img src={evidenceUrl} alt="Captured evidence" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        className="h-8"
                        onClick={() => {
                          setEvidenceUrl(null);
                          setLocation(null);
                          setEvidenceLocationLabel('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Retake
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit gap-1.5 border-primary-500/30 text-primary-400 bg-black/50 backdrop-blur-md">
                        <Camera className="w-3 h-3" /> Captured via Camera
                      </Badge>
                      {location && (
                        <a 
                          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Badge variant="outline" className="w-fit gap-1.5 border-accent-green/30 text-accent-green bg-black/50 backdrop-blur-md">
                            <MapPin className="w-3 h-3" /> Verified Location Map
                          </Badge>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {evidenceUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Photo Evidence Location (separate)</label>
                    <div className="relative">
                      <Input
                        placeholder="Pick or type photo capture location"
                        value={evidenceLocationLabel}
                        onFocus={() => setShowEvidenceLocationSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowEvidenceLocationSuggestions(false), 120)}
                        onChange={(e) => setEvidenceLocationLabel(e.target.value)}
                      />
                      {showEvidenceLocationSuggestions && evidenceLocationSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-900 shadow-xl max-h-44 overflow-y-auto">
                          {evidenceLocationSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onMouseDown={() => {
                                setEvidenceLocationLabel(option);
                                setShowEvidenceLocationSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">Use this to assign a different location for where the photo was captured.</p>
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
              <Button type="submit" variant="gradient" disabled={isSubmitting || isCameraOpen} className="gap-2">
                {isSubmitting ? t('submitting', 'Submitting...') : (
                  <>{t('submitReport', 'Submit Report')} <Send className="w-4 h-4" /></>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Advanced AI Suggestions Panel */}
        <div className="lg:h-full">
          {(isAnalyzing || aiAnalysis) ? (
            <Card className="h-full border-primary-500/30 bg-primary-900/10 shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in-up flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-primary-500" />
              </div>
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  Advanced AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 flex-1">
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : aiAnalysis && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-dark-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Activity className="w-4 h-4" /> Category
                          </div>
                        </div>
                        <p className="font-semibold text-brand-dark dark:text-white">{aiAnalysis.category}</p>
                      </div>
                      
                      <div className={cn(
                        "rounded-xl p-4 border",
                        aiAnalysis.priority === 'High' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' :
                        aiAnalysis.priority === 'Moderate' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
                        'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                      )}>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                          <ShieldAlert className="w-4 h-4" /> Priority Level
                        </div>
                        <p className={cn(
                          "font-semibold",
                          aiAnalysis.priority === 'High' ? 'text-red-400' :
                          aiAnalysis.priority === 'Moderate' ? 'text-amber-400' :
                          'text-emerald-400'
                        )}>{aiAnalysis.priority}</p>
                      </div>

                      <div className="sm:col-span-2 bg-slate-50 dark:bg-dark-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                          <ShieldAlert className="w-4 h-4" /> Suggested Department
                        </div>
                        <Badge variant="outline" className="bg-primary-500/10 border-primary-500/30 text-primary-400">
                          {aiAnalysis.department}
                        </Badge>
                      </div>

                      <div className="sm:col-span-2 bg-slate-50 dark:bg-dark-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                          <Activity className="w-4 h-4" /> Escalation Prediction
                        </div>
                        <p className="font-semibold text-brand-dark dark:text-white">{aiAnalysis.escalationLikelihood}</p>
                        {aiAnalysis.matchedExample && (
                          <p className="text-xs text-slate-500 mt-2">
                            Closest dataset pattern: "{aiAnalysis.matchedExample}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <Sparkles className="w-4 h-4" /> Key Factors
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.keywords && aiAnalysis.keywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-white/5">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2 pb-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <BarChart2 className="w-4 h-4" />
                        AI Confidence
                      </div>
                      <Badge variant="outline" className="text-primary-400 border-primary-500/30 bg-primary-500/10">
                        {aiAnalysis.confidence} match
                      </Badge>
                    </div>

                    {/* NEW: Word-by-Word Analysis Visualization */}
                    <div className="px-2 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <Activity className="w-4 h-4" /> Word-by-Word Impact
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {aiAnalysis.wordAnalysis && aiAnalysis.wordAnalysis.map((item, i) => (
                          <span 
                            key={i} 
                            className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider",
                              item.impact === "High" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                              item.impact === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                              "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}
                          >
                            {item.word}: {item.impact}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 italic">
                        * The model evaluates each token to determine the final priority level.
                      </p>
                    </div>

                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-dark-800/30">
              <div className="w-16 h-16 rounded-full bg-primary-500/10 dark:bg-primary-500/5 flex items-center justify-center mb-4 relative">
                <Sparkles className="w-8 h-8 text-primary-400 dark:text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-brand-dark dark:text-slate-300 mb-2">Real-time AI Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-500 max-w-sm">
                As you describe the incident, our AI will automatically analyze the threat level, categorize the conflict, and route it to the appropriate department.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
