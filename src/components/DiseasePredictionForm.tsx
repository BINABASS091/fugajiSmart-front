import { useState, useCallback } from 'react';
import { Upload, X, Zap, AlertCircle, Clock, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PredictionResultsDisplay } from './PredictionResultsDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface PredictionResult {
  prediction: string;
  confidence: number;
  confidence_percentage: string;
  timestamp: string;
  filename: string;
  image_size: string;
  source: string;
  error?: string;
}

interface DiseasePredictionFormProps {
  onPredictionComplete?: (result: PredictionResult) => void;
}

// Mock disease predictions for demo purposes
const MOCK_PREDICTIONS = [
  { prediction: 'Healthy', confidence: 0.95 },
  { prediction: 'Newcastle Disease', confidence: 0.87 },
  { prediction: 'Avian Influenza', confidence: 0.82 },
  { prediction: 'Marek\'s Disease', confidence: 0.79 },
  { prediction: 'Coccidiosis', confidence: 0.75 },
  { prediction: 'Healthy', confidence: 0.92 },
];

export function DiseasePredictionForm({ onPredictionComplete }: DiseasePredictionFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file must be smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const handlePredict = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get image dimensions
      const img = new Image();
      const imgUrl = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(imgUrl);
          resolve(null);
        };
        img.onerror = reject;
        img.src = imgUrl;
      });

      // Generate mock prediction
      const randomPrediction = MOCK_PREDICTIONS[Math.floor(Math.random() * MOCK_PREDICTIONS.length)];
      const confidence = randomPrediction.confidence + (Math.random() * 0.05 - 0.025); // Add slight variation
      
      const predictionResult: PredictionResult = {
        prediction: randomPrediction.prediction,
        confidence: Math.min(0.99, Math.max(0.5, confidence)),
        confidence_percentage: `${(confidence * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        filename: selectedFile.name,
        image_size: `${img.width}x${img.height}`,
        source: 'mock_prediction',
      };

      setResult(predictionResult);

      // Save to localStorage for history
      if (user) {
        try {
          const stored = localStorage.getItem('disease_predictions');
          const predictions = stored ? JSON.parse(stored) : [];
          
          const newPrediction = {
            id: `pred-${Date.now()}`,
            crop_name: 'Poultry',
            image_url: previewUrl || '',
            prediction: predictionResult.prediction,
            confidence: Math.round(predictionResult.confidence * 100),
            created_at: predictionResult.timestamp,
            farmer_id: user.id,
          };
          
          predictions.unshift(newPrediction);
          localStorage.setItem('disease_predictions', JSON.stringify(predictions));
        } catch (err) {
          console.error('Error saving prediction to history:', err);
        }
      }
      
      if (onPredictionComplete) {
        onPredictionComplete(predictionResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          {t('disease.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative"
        >
          {!selectedFile ? (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t('disease.uploadPrompt')}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t('disease.dragDrop')}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="relative z-10 pointer-events-none">
                {t('disease.chooseFile')}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded-lg shadow-md"
                />
                <button
                  onClick={clearSelection}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Predict Button */}
        {selectedFile && (
          <Button
            onClick={handlePredict}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                {t('disease.analyzing')}
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                {t('disease.detectButton')}
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {result && <PredictionResultsDisplay result={result} />}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{t('disease.tipsTitle')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t('disease.tip1')}</li>
            <li>• {t('disease.tip2')}</li>
            <li>• {t('disease.tip3')}</li>
            <li>• {t('disease.tip4')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
