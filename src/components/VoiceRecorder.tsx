import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, MicOff, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  onTranscriptConfirm: (transcript: string) => void;
  isDisabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  onTranscriptConfirm,
  isDisabled = false
}) => {
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useSpeechRecognition();

  React.useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onTranscriptConfirm(transcript.trim());
      resetTranscript();
    }
  };

  const handleReset = () => {
    resetTranscript();
    if (isListening) {
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <AlertCircle size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Trình duyệt không hỗ trợ ghi âm giọng nói
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleToggleListening}
          disabled={isDisabled}
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isListening ? (
            <>
              <MicOff size={16} />
              Dừng ghi âm
            </>
          ) : (
            <>
              <Mic size={16} />
              Bắt đầu ghi âm
            </>
          )}
        </Button>

        {transcript && (
          <>
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={isDisabled}
            >
              <RotateCcw size={16} className="mr-1" />
              Làm mới
            </Button>
            
            <Button
              type="button"
              onClick={handleConfirm}
              variant="default"
              size="sm"
              disabled={isDisabled || !transcript.trim()}
            >
              <Check size={16} className="mr-1" />
              Xác nhận
            </Button>
          </>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {isListening && (
          <Badge variant="default" className="flex items-center gap-1 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            Đang nghe...
          </Badge>
        )}

        {transcript && !isListening && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check size={12} />
            Có nội dung
          </Badge>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle size={16} className="text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Nội dung đã ghi nhận:
          </div>
          <div className="text-sm">
            {transcript.split('[tạm thời: ').map((part, index) => {
              if (index === 0) {
                return <span key={index}>{part}</span>;
              }
              const [interim, rest] = part.split(']');
              return (
                <span key={index}>
                  <span className="text-muted-foreground italic">
                    {interim}
                  </span>
                  {rest}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!transcript && !isListening && (
        <div className="text-xs text-muted-foreground">
          💡 Nhấn "Bắt đầu ghi âm" và nói nội dung ghi chú của bạn. 
          Hỗ trợ tiếng Việt.
        </div>
      )}
    </div>
  );
};
