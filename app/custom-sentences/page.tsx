"use client"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertTriangle, Trash2, Sparkles, BookOpen, Plus, Star, TrendingUp, Trophy } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sentencesByLevel, type Sentence } from "@/data/pronunciation";
import { useRouter } from 'next/navigation';

import { LevelSelector, LevelConfig } from '@/components/pronunciation/LevelSelector';

import { PracticeDisplay } from '@/components/pronunciation/PracticeDisplay';
import { CustomSentenceModal } from '@/components/pronunciation/CustomSentenceModal';

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'custom';
export type WordAccuracy = Array<{ word: string; accuracy: number; isCorrect: boolean }>;

const levelConfig: { [key in Level]: LevelConfig & { accuracyThreshold: number } } = {
  beginner: {
    name: "Beginner",
    description: "Simple sentences with basic vocabulary",
    color: "emerald",
    icon: Star,        // ⭐
    accuracyThreshold: 0.6,
  },
  intermediate: {
    name: "Intermediate",
    description: "Medium complexity sentences with varied vocabulary",
    color: "blue",
    icon: TrendingUp,  // 📈
    accuracyThreshold: 0.7,
  },
  advanced: {
    name: "Advanced",
    description: "Complex sentences with advanced vocabulary",
    color: "purple",
    icon: Trophy,      // 🏆
    accuracyThreshold: 0.8,
  },
  custom: {
    name: "Custom",
    description: "Your own sentences with AI-generated phonetics",
    color: "indigo",
    icon: Plus,        // ➕
    accuracyThreshold: 0.7,
  },
};

function PronunciationPractice() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [wordAccuracy, setWordAccuracy] = useState<WordAccuracy>([]);
  const [recordings, setRecordings] = useState<(string | null)[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const [customSentences, setCustomSentences] = useState<Sentence[]>([]);
  const [customSentenceText, setCustomSentenceText] = useState('');
  const [isGeneratingPhonetic, setIsGeneratingPhonetic] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customView, setCustomView] = useState<'list' | 'practice'>('list');

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const supabase = createClient();
  const { user, loading } = useAuth();
  const router = useRouter();

  const currentSentences = useMemo((): Sentence[] => {
    if (selectedLevel === 'custom') return customSentences;
    return sentencesByLevel[selectedLevel] || [];
  }, [selectedLevel, customSentences]);

  const currentLevelConfig = levelConfig[selectedLevel];
  const currentSentenceData = currentSentences[currentSentence];

  const clearError = useCallback(() => {
    setErrorMessage(''); setIsRetrying(false); retryCountRef.current = 0;
  }, []);

  const loadCustomSentences = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('custom_sentences').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: true });
      if (error) { console.error(error); return; }
      setCustomSentences((data ?? []).map(item => ({
        text: item.text,
        phonetic: item.phonetic || '',
        readablePhonetic: item.readable_phonetic || '',
        words: item.words || [],
      })));
    } catch (err) { console.error(err); }
  }, [user, supabase]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = selectedLevel === 'beginner' ? 0.7 : selectedLevel === 'intermediate' ? 0.8 : 0.9;
      u.onstart = () => setIsPlaying(true);
      u.onend = () => setIsPlaying(false);
      speechSynthesis.speak(u);
    }
  };
  const stopSpeech = () => { speechSynthesis.cancel(); setIsPlaying(false); };

  const levenshteinDistance = (s1: string, s2: string): number => {
    const m: number[][] = [];
    for (let i = 0; i <= s2.length; i++) m[i] = [i];
    for (let j = 0; j <= s1.length; j++) m[0][j] = j;
    for (let i = 1; i <= s2.length; i++)
      for (let j = 1; j <= s1.length; j++)
        m[i][j] = s2[i-1] === s1[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
    return m[s2.length][s1.length];
  };
  const calcSim = (a: string, b: string) => {
    const l = a.length > b.length ? a : b, s = a.length > b.length ? b : a;
    return l.length ? (l.length - levenshteinDistance(l, s)) / l.length : 1;
  };
  const analyzeAccuracy = (text: string, words: string[]) => {
    const uw = text.toLowerCase().split(' '), t = currentLevelConfig.accuracyThreshold;
    setWordAccuracy(words.map((w, i) => { const sim = calcSim(w.toLowerCase().replace(/[.,!?;:]/g,''), (uw[i]||'').replace(/[.,!?;:]/g,'')); return { word:w, accuracy:sim, isCorrect:sim>t }; }));
  };

  const initializeSpeechRecognition = () => {
    if (!speechRecognitionSupported) return null;
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const r = new SR(); r.continuous=false; r.interimResults=true; r.lang='en-US'; r.maxAlternatives=1;
      r.onstart = () => { setIsListening(true); setErrorMessage(''); setIsRetrying(false); if (!retryCountRef.current) { setUserTranscript(''); setWordAccuracy([]); } };
      r.onresult = (e: any) => {
        let f='', im='';
        for (let i=e.resultIndex;i<e.results.length;i++) e.results[i].isFinal?(f+=e.results[i][0].transcript):(im+=e.results[i][0].transcript);
        if (f) { setUserTranscript(f.trim()); if (currentSentences[currentSentence]) analyzeAccuracy(f.trim(), currentSentences[currentSentence].words); retryCountRef.current=0; }
        else if (im) setUserTranscript(im.trim()+'...');
      };
      r.onerror = (e: any) => {
        const msgs: Record<string,string> = { network:'Network issue.','not-allowed':'Mic denied.','no-speech':'No speech.','audio-capture':'No mic.',aborted:'Aborted.' };
        if (e.error==='network'&&retryCountRef.current<maxRetries) { retryCountRef.current++; setErrorMessage(`Retrying... (${retryCountRef.current}/${maxRetries})`); setIsRetrying(true); setTimeout(()=>{ try{recognitionRef.current?.start();}catch{setIsListening(false);setIsRetrying(false);} },2000); return; }
        if (e.error!=='no-speech') setErrorMessage(msgs[e.error]||`Error: ${e.error}`);
        setIsListening(false); setIsRetrying(false);
      };
      r.onend = () => {
        if (isListening&&!isRetrying&&!retryCountRef.current) setTimeout(()=>{ try{if(isListening&&recognitionRef.current&&!errorMessage)recognitionRef.current.start();}catch{setIsListening(false);} },100);
        else if (!isRetrying) setIsListening(false);
      };
      return r;
    } catch { setSpeechRecognitionSupported(false); return null; }
  };

  const stopRecording = () => {
    setIsListening(false); setIsRetrying(false); retryCountRef.current=0;
    if (mediaRecorder?.state==='recording') { mediaRecorder.stop(); setMediaRecorder(null); }
    try { recognitionRef.current?.stop(); } catch {}
  };

  const startRecording = async () => {
    clearError(); if (isPlaying) stopSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const recorder = new MediaRecorder(stream); chunksRef.current=[];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current,{type:'audio/wav'});
        const url = URL.createObjectURL(blob);
        const nr=[...recordings]; nr[currentSentence]=url; setRecordings(nr); setCurrentRecording(url);
        if (user&&currentSentences[currentSentence]) {
          try {
            const fn=`${user.id}/${selectedLevel}/${Date.now()}-s-${currentSentence+1}.wav`;
            const {error:ue}=await supabase.storage.from('pronunciation-audio').upload(fn,blob,{contentType:'audio/wav',cacheControl:'3600',upsert:false});
            if (ue){setErrorMessage(`Upload failed: ${ue.message}`);return;}
            const {data:pu}=supabase.storage.from('pronunciation-audio').getPublicUrl(fn);
            const {error:ie}=await supabase.from('pronunciation_attempts').insert({user_id:user.id,sentence:currentSentences[currentSentence].text,spoken_text:userTranscript||'',audio_url:pu.publicUrl,accuracy:wordAccuracy.map(w=>w.accuracy),difficulty_level:selectedLevel,sentence_index:currentSentence}).select();
            if (ie) setErrorMessage(`Save failed: ${ie.message}`);
          } catch(e:any){setErrorMessage(`Error: ${e.message}`);}
        }
        stream.getTracks().forEach(t=>t.stop());
      };
      recorder.start(); setMediaRecorder(recorder); setIsListening(true); retryCountRef.current=0;
      const rec=initializeSpeechRecognition(); recognitionRef.current=rec;
      if (rec) setTimeout(()=>{ try{if(recognitionRef.current&&isListening)recognitionRef.current.start();}catch{setErrorMessage('Failed to start speech recognition.');setIsListening(false);} },100);
      else setErrorMessage('Speech recognition unavailable. You can still record audio.');
    } catch { setErrorMessage('Mic access denied. Check permissions.'); setIsListening(false); }
  };

  const resetPractice = () => { setUserTranscript(''); setWordAccuracy([]); stopSpeech(); clearError(); stopRecording(); };
  const playRecording = (url:string) => { if(audioRef.current){audioRef.current.src=url;audioRef.current.play();} };
  const goToNext = () => { if(currentSentence<currentSentences.length-1){const n=currentSentence+1;setCurrentSentence(n);setUserTranscript('');setWordAccuracy([]);setCurrentRecording(recordings[n]??null);clearError();} };
  const goToPrev = () => { if(currentSentence>0){const p=currentSentence-1;setCurrentSentence(p);setUserTranscript('');setWordAccuracy([]);setCurrentRecording(recordings[p]??null);clearError();} };

  const handleLevelChange = (level: Level) => {
    if (isListening) stopRecording(); if (isPlaying) stopSpeech();
    setSelectedLevel(level); clearError();
    if (level==='custom') setCustomView('list');
  };

  const generatePhonetic = async (text: string) => {
    const res = await fetch('/api/generate-phonetic', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}) });
    const data = await res.json();
    if (!res.ok||data.error) throw new Error(data.error||`HTTP ${res.status}`);
    return { phonetic:data.phonetic||'', readablePhonetic:data.readablePhonetic||'', words:text.split(' ').map(w=>w.replace(/[.,!?;:]/g,'')) };
  };

  const addCustomSentence = async () => {
    if (!customSentenceText.trim()) { setErrorMessage('Please enter a valid sentence'); return; }
    if (!user) { setErrorMessage('You must be logged in'); return; }
    setIsGeneratingPhonetic(true); setErrorMessage('');
    try {
      const { phonetic, readablePhonetic, words } = await generatePhonetic(customSentenceText.trim());
      const { error } = await supabase.from('custom_sentences').insert({ user_id:user.id, text:customSentenceText.trim(), phonetic, readable_phonetic:readablePhonetic, words }).select().single();
      if (error) throw new Error(error.message);
      setShowCustomModal(false); setCustomSentenceText('');
      setSelectedLevel('custom'); await loadCustomSentences(); setCustomView('list');
    } catch(err:any) { setErrorMessage(`Failed: ${err.message}`); }
    finally { setIsGeneratingPhonetic(false); }
  };

  const deleteCustomSentence = async (index: number) => {
    if (!user) return;
    try {
      const {error}=await supabase.from('custom_sentences').delete().eq('user_id',user.id).eq('text',customSentences[index].text);
      if (error) throw new Error(error.message);
      const updated=customSentences.filter((_,i)=>i!==index); setCustomSentences(updated);
      if (currentSentence>=updated.length&&updated.length>0) setCurrentSentence(updated.length-1);
      else if (!updated.length) { setCurrentSentence(0); setCustomView('list'); }
      setRecordings(new Array(updated.length).fill(null));
    } catch(err:any){setErrorMessage(`Delete failed: ${err.message}`);}
  };

  const practiceSpecific = (index: number) => {
    setCurrentSentence(index); setUserTranscript(''); setWordAccuracy([]); setCurrentRecording(null);
    setCustomView('practice');
  };

  useEffect(()=>{ if(selectedLevel==='custom'&&user) loadCustomSentences(); },[user,selectedLevel,loadCustomSentences]);
  useEffect(()=>{
    setRecordings(new Array(currentSentences.length).fill(null));
    setCurrentSentence(0); setUserTranscript(''); setWordAccuracy([]); setCurrentRecording(null);
    if (!('webkitSpeechRecognition' in window)&&!('SpeechRecognition' in window)) { setSpeechRecognitionSupported(false); setErrorMessage('Speech recognition not supported. Use Chrome, Edge, or Safari.'); }
  },[selectedLevel,currentSentences.length]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-900">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400"/><p className="text-gray-300">Loading...</p></div>
    </div>
  );

  const renderCustomList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{customSentences.length} sentence{customSentences.length!==1?'s':''} saved</p>
        <button onClick={()=>setShowCustomModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={15}/><span>Add Sentence</span>
        </button>
      </div>
      {customSentences.length===0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-50"/>
          <p className="text-white text-lg font-medium">No custom sentences yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Add a sentence and AI will generate phonetics for you</p>
          <button onClick={()=>setShowCustomModal(true)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">+ Add Your First Sentence</button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {customSentences.map((s,i)=>(
            <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-indigo-500 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-base mb-2 leading-snug">{s.text}</p>
                  {s.readablePhonetic&&(
                    <p className="text-indigo-300 text-sm font-mono bg-indigo-950/40 border border-indigo-900 rounded px-3 py-1 inline-block mb-2">{s.readablePhonetic}</p>
                  )}
                  {s.phonetic&&<p className="text-gray-500 text-xs font-mono">{s.phonetic}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <button onClick={()=>practiceSpecific(i)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <BookOpen size={14}/><span>Practice</span>
                  </button>
                  <button onClick={()=>deleteCustomSentence(i)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Pronunciation Practice</h1>
          {/* <div className="text-right">
            {user
              ? (<><p className="text-sm text-gray-400">Welcome back,</p><p className="font-medium text-white">{user.email}</p></>)
              : (<><p className="text-sm text-gray-400">Guest Mode</p><button onClick={()=>router.push('/login')} className="text-sm text-indigo-400 hover:text-indigo-300 underline">Log in for full features</button></>)
            }
          </div> */}
        </div>

        <LevelSelector
          levelConfig={levelConfig} selectedLevel={selectedLevel} onLevelChange={handleLevelChange}
          customSentenceCount={customSentences.length}
          beginnerSentenceCount={sentencesByLevel.beginner.length}
          intermediateSentenceCount={sentencesByLevel.intermediate.length}
          advancedSentenceCount={sentencesByLevel.advanced.length}
        />

        {/* Error */}
        {errorMessage&&(
          <div className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={20}/>
              <div className="flex-1">
                <p className="text-red-300">{errorMessage}</p>
                {isRetrying&&<div className="mt-2 flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"/><span className="text-sm text-red-400">Retrying...</span></div>}
                <button onClick={clearError} className="mt-2 text-sm text-red-400 hover:text-red-300 underline">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* Custom level */}
        {selectedLevel==='custom' ? (
          !user ? (
            <div className="text-center py-16">
              <Sparkles className="w-14 h-14 text-indigo-500 mx-auto mb-4 opacity-60"/>
              <h3 className="text-xl font-medium text-white mb-2">Login Required</h3>
              <p className="text-gray-400 mb-6">Please log in to create and practice custom sentences.</p>
              <button onClick={()=>router.push('/login')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Log In</button>
            </div>
          ) : customView==='list' ? (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="text-indigo-400" size={20}/>
                <h2 className="text-lg font-semibold text-white">Custom Sentences with AI</h2>
              </div>
              {renderCustomList()}
            </div>
          ) : (
            <div>
              <button onClick={()=>{setCustomView('list');resetPractice();}} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mb-6 transition-colors">
                ← Back to all sentences
              </button>
              {currentSentences.length>0&&currentSentenceData&&(
                <>
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-800">
                      <Sparkles size={16} className="mr-2"/>
                      <span className="font-medium">Custom Level</span>
                      <span className="ml-2 text-xs opacity-75">(70% accuracy needed)</span>
                    </div>
                  </div>
                  <PracticeDisplay
                    currentSentenceData={currentSentenceData}
                    currentSentencesLength={currentSentences.length}
                    currentSentenceIndex={currentSentence}
                    wordAccuracy={wordAccuracy} selectedLevel={selectedLevel}
                    currentLevelConfig={currentLevelConfig}
                    isListening={isListening} isPlaying={isPlaying}
                    userTranscript={userTranscript} currentRecording={currentRecording}
                    speechRecognitionSupported={speechRecognitionSupported}
                    speakText={()=>speakText(currentSentenceData.text)}
                    stopSpeech={stopSpeech} startRecording={startRecording} stopRecording={stopRecording}
                    resetPractice={resetPractice} playRecording={playRecording}
                    goToPreviousSentence={goToPrev} goToNextSentence={goToNext}
                    deleteCustomSentence={deleteCustomSentence}
                    router={router} user={user}
                  />
                </>
              )}
            </div>
          )
        ) : (
          <>
            {currentSentences.length>0&&(
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${currentLevelConfig.color}-950/50 text-${currentLevelConfig.color}-300 border border-${currentLevelConfig.color}-800`}>
                  <currentLevelConfig.icon size={16} className="mr-2"/>
                  <span className="font-medium">{currentLevelConfig.name} Level</span>
                  <span className="ml-2 text-xs opacity-75">({Math.round(currentLevelConfig.accuracyThreshold*100)}% accuracy needed)</span>
                </div>
              </div>
            )}
            <PracticeDisplay
              currentSentenceData={currentSentenceData}
              currentSentencesLength={currentSentences.length}
              currentSentenceIndex={currentSentence}
              wordAccuracy={wordAccuracy} selectedLevel={selectedLevel}
              currentLevelConfig={currentLevelConfig}
              isListening={isListening} isPlaying={isPlaying}
              userTranscript={userTranscript} currentRecording={currentRecording}
              speechRecognitionSupported={speechRecognitionSupported}
              speakText={()=>speakText(currentSentenceData?.text||'')}
              stopSpeech={stopSpeech} startRecording={startRecording} stopRecording={stopRecording}
              resetPractice={resetPractice} playRecording={playRecording}
              goToPreviousSentence={goToPrev} goToNextSentence={goToNext}
              deleteCustomSentence={deleteCustomSentence}
              router={router} user={user}
            />
            {currentSentences.length>0&&(
              <div className="mt-6 text-center text-sm text-gray-400">
                {selectedLevel==='beginner'&&'Master the basics here, then try Intermediate level!'}
                {selectedLevel==='intermediate'&&'Challenge yourself with Advanced level next!'}
                {selectedLevel==='advanced'&&"You're practicing at the highest level. Keep up the great work!"}
              </div>
            )}
          </>
        )}

        <CustomSentenceModal
          show={showCustomModal}
          sentenceText={customSentenceText}
          isGenerating={isGeneratingPhonetic}
          onTextChange={setCustomSentenceText}
          onAdd={addCustomSentence}
          onClose={()=>{setShowCustomModal(false);clearError();}}
        />

        <audio ref={audioRef} className="hidden" controls/>
      </div>
    </div>
  );
}

export default PronunciationPractice;