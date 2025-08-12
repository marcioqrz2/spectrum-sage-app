"use client";

import { useState, useRef, ChangeEvent, DragEvent, FC } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud } from "lucide-react";

import { extractArticleTextFromUrl } from "@/ai/flows/extract-article-text-from-url";
import { generatePerspectives, GeneratePerspectivesOutput } from "@/ai/flows/generate-perspectives";

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

type TabValue = 'link' | 'text' | 'pdf';

const Loader: FC = () => (
  <div className="text-center my-4 py-8">
    <svg className="inline w-10 h-10 mr-3 text-muted-foreground animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill=" hsl(var(--primary))"/>
    </svg>
    <p className="mt-4 text-lg text-muted-foreground">Analisando... Isso pode levar alguns segundos.</p>
  </div>
);

const biasColorMap: { [key: string]: string } = {
  'Esquerda': 'text-blue-400',
  'Centro-Esquerda': 'text-blue-300',
  'Centro': 'text-gray-300',
  'Centro-Direita': 'text-red-300',
  'Direita': 'text-red-400',
};

const ResultsDisplay: FC<{ results: GeneratePerspectivesOutput }> = ({ results }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-center font-headline text-white">Resultado da Análise</h2>
    
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-muted-foreground">Confiança na Análise de Viés</span>
        <span className="text-sm font-medium text-muted-foreground">{results.confidenceBias}%</span>
      </div>
      <Progress value={results.confidenceBias} className="h-2.5" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
      <div className="bg-background/50 p-4 rounded-lg border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Viés Geral</h3>
        <p className={`text-2xl font-bold mt-1 ${biasColorMap[results.overallBias] || 'text-gray-300'}`}>{results.overallBias}</p>
      </div>
      <div className="bg-background/50 p-4 rounded-lg border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nível de Factualidade</h3>
        <p className="text-2xl font-bold mt-1 text-gray-300">{results.factuality}</p>
      </div>
    </div>

    <div className="bg-background/50 p-6 rounded-lg border">
      <h3 className="font-semibold text-lg mb-2 text-white font-headline">Resumo Neutro do Artigo</h3>
      <p className="text-muted-foreground">{results.articleSummary}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card/50 border rounded-lg p-4 h-full flex flex-col">
        <h3 className="pb-2 mb-4 font-semibold text-lg border-b-2 border-blue-400 text-blue-300 font-headline">Perspectiva da Esquerda</h3>
        <p className="text-muted-foreground text-sm flex-grow">{results.leftPerspective}</p>
      </div>
      <div className="bg-card/50 border rounded-lg p-4 h-full flex flex-col">
        <h3 className="pb-2 mb-4 font-semibold text-lg border-b-2 border-zinc-500 text-zinc-300 font-headline">Perspectiva do Centro</h3>
        <p className="text-muted-foreground text-sm flex-grow">{results.centerPerspective}</p>
      </div>
      <div className="bg-card/50 border rounded-lg p-4 h-full flex flex-col">
        <h3 className="pb-2 mb-4 font-semibold text-lg border-b-2 border-red-400 text-red-300 font-headline">Perspectiva da Direita</h3>
        <p className="text-muted-foreground text-sm flex-grow">{results.rightPerspective}</p>
      </div>
    </div>
    
    <p className="text-xs text-muted-foreground/50 mt-8 text-center">*Esta análise é gerada por IA e serve como uma ferramenta de interpretação, não como um veredito definitivo.</p>
  </div>
);


export default function SpectrumSagePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('link');
  const [linkInput, setLinkInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratePerspectivesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
      setError(null);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfFileName(file.name);
      setError(null);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  async function readPdfText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            return reject('Falha ao ler o arquivo.');
          }
          const pdf = await pdfjsLib.getDocument(event.target.result).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => (item as TextItem).str).join(' ') + '\n';
          }
          resolve(fullText);
        } catch (error) {
          console.error("Erro ao analisar PDF:", error);
          reject('Não foi possível ler o arquivo PDF.');
        }
      };
      reader.onerror = () => reject('Erro ao ler o arquivo.');
      reader.readAsArrayBuffer(file);
    });
  }

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      let content = '';
      if (activeTab === 'link') {
        if (!linkInput.trim() || !linkInput.startsWith('http')) {
          throw new Error('Por favor, insira uma URL válida.');
        }
        const extracted = await extractArticleTextFromUrl({ url: linkInput });
        content = extracted.textContent;
      } else if (activeTab === 'text') {
        content = textInput.trim();
        if (!content) {
          throw new Error('Por favor, insira um texto para analisar.');
        }
      } else if (activeTab === 'pdf') {
        if (!pdfFile) {
          throw new Error('Por favor, selecione um arquivo PDF.');
        }
        content = await readPdfText(pdfFile);
      }

      if (content.length < 100) {
        throw new Error('O conteúdo é muito curto para uma análise significativa.');
      }
      
      const analysisResult = await generatePerspectives({ articleContent: content });
      setResults(analysisResult);

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-body">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl p-6 md:p-10 bg-black/50 backdrop-blur-2xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-400 font-headline">
            Analisador de Espectro Político
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Cole um link, texto ou PDF e receba uma análise multifacetada da notícia.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="link">Analisar Link</TabsTrigger>
            <TabsTrigger value="text">Analisar Texto</TabsTrigger>
            <TabsTrigger value="pdf">Analisar PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="mt-6">
            <Input 
              type="url" 
              placeholder="https://exemplo.com/noticia..." 
              className="p-4 h-14 text-base bg-input border-2 focus:border-primary"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              disabled={isLoading}
            />
          </TabsContent>
          <TabsContent value="text" className="mt-6">
            <Textarea 
              rows={8} 
              placeholder="Cole o conteúdo da publicação aqui..." 
              className="p-4 text-base bg-input border-2 focus:border-primary"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isLoading}
            />
          </TabsContent>
          <TabsContent value="pdf" className="mt-6">
            <label 
              onDrop={handleDrop} 
              onDragOver={handleDragOver}
              htmlFor="pdf-upload" 
              className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/40 transition-colors border-muted-foreground/50 hover:border-primary">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                <p className="mb-2 text-base text-muted-foreground"><span className="font-semibold text-foreground">Clique para enviar</span> ou arraste e solte</p>
                {pdfFileName && <p className="text-base text-primary mt-2 font-medium">{pdfFileName}</p>}
              </div>
              <input id="pdf-upload" ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} disabled={isLoading} />
            </label>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button
            id="analyze-button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full sm:w-auto font-bold py-3 px-10 h-12 text-base rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg hover:shadow-primary/20 text-primary-foreground disabled:bg-muted disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analisando...' : 'Analisar'}
          </Button>
        </div>

        <div className="mt-10">
          {isLoading && <Loader />}
          {error && (
            <Alert variant="destructive" className="mt-6 bg-destructive/20 border-destructive">
              <AlertDescription className="text-center text-destructive-foreground/80 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {results && !isLoading && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );
}
