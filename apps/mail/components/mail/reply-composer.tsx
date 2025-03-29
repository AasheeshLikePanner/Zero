'use client';

import { type Dispatch, type SetStateAction, useRef, useState, useEffect, useCallback, useReducer } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UploadedFileIcon } from '@/components/create/uploaded-file-icon';
import { ArrowUp, Paperclip, Reply, X, Plus, Sparkles, Check, X as XIcon } from 'lucide-react';
import { cleanEmailAddress, truncateFileName, cn, convertJSONToHTML, createAIJsonContent } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import Editor from '@/components/create/editor';
import { Button } from '@/components/ui/button';
import type { ParsedMessage } from '@/types';
import { useTranslations } from 'next-intl';
import { sendEmail } from '@/actions/send';
import { toast } from 'sonner';
import type { JSONContent } from 'novel';
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { generateAIResponse } from '@/actions/ai-reply';

// Define state interfaces
interface ComposerState {
  isUploading: boolean;
  isComposerOpen: boolean;
  isDragging: boolean;
  isEditorFocused: boolean;
  editorKey: number;
  editorInitialValue?: JSONContent;
}

interface AIState {
  isLoading: boolean;
  suggestion: string | null;
  showOptions: boolean;
}

// Define action types
type ComposerAction =
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_COMPOSER_OPEN'; payload: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_EDITOR_FOCUSED'; payload: boolean }
  | { type: 'INCREMENT_EDITOR_KEY' }
  | { type: 'SET_EDITOR_INITIAL_VALUE'; payload: JSONContent | undefined };

type AIAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUGGESTION'; payload: string | null }
  | { type: 'SET_SHOW_OPTIONS'; payload: boolean }
  | { type: 'RESET' };

// Create reducers
const composerReducer = (state: ComposerState, action: ComposerAction): ComposerState => {
  switch (action.type) {
    case 'SET_UPLOADING':
      return { ...state, isUploading: action.payload };
    case 'SET_COMPOSER_OPEN':
      return { ...state, isComposerOpen: action.payload };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'SET_EDITOR_FOCUSED':
      return { ...state, isEditorFocused: action.payload };
    case 'INCREMENT_EDITOR_KEY':
      return { ...state, editorKey: state.editorKey + 1 };
    case 'SET_EDITOR_INITIAL_VALUE':
      return { ...state, editorInitialValue: action.payload };
    default:
      return state;
  }
};

const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SUGGESTION':
      return { ...state, suggestion: action.payload };
    case 'SET_SHOW_OPTIONS':
      return { ...state, showOptions: action.payload };
    case 'RESET':
      return { isLoading: false, suggestion: null, showOptions: false };
    default:
      return state;
  }
};

interface ReplyComposeProps {
  emailData: ParsedMessage[];
  isOpen?: boolean;
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
}

type FormData = {
  messageContent: string;
};

export default function ReplyCompose({ emailData, isOpen, setIsOpen }: ReplyComposeProps) {
  // Keep attachments separate as it's an array that needs direct manipulation
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Use reducers instead of multiple useState
  const [composerState, composerDispatch] = useReducer(composerReducer, {
    isUploading: false,
    isComposerOpen: false,
    isDragging: false,
    isEditorFocused: false,
    editorKey: 0,
    editorInitialValue: undefined,
  });

  const [aiState, aiDispatch] = useReducer(aiReducer, {
    isLoading: false,
    suggestion: null,
    showOptions: false,
  });

  const composerRef = useRef<HTMLFormElement>(null);
  const t = useTranslations();

  // Use external state if provided, otherwise use internal state
  const composerIsOpen = isOpen !== undefined ? isOpen : composerState.isComposerOpen;
  const setComposerIsOpen = (value: boolean) => {
    if (setIsOpen) {
      setIsOpen(value);
    } else {
      composerDispatch({ type: 'SET_COMPOSER_OPEN', payload: value });
    }
  };

  // Handle keyboard shortcuts for sending email
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isFormValid) {
        void handleSendEmail(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      composerDispatch({ type: 'SET_UPLOADING', payload: true });
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAttachments([...attachments, ...Array.from(e.target.files)]);
      } finally {
        composerDispatch({ type: 'SET_UPLOADING', payload: false });
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.target || !(e.target as HTMLElement).closest('.ProseMirror')) {
      e.preventDefault();
      e.stopPropagation();
      composerDispatch({ type: 'SET_DRAGGING', payload: true });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.target || !(e.target as HTMLElement).closest('.ProseMirror')) {
      e.preventDefault();
      e.stopPropagation();
      composerDispatch({ type: 'SET_DRAGGING', payload: false });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!e.target || !(e.target as HTMLElement).closest('.ProseMirror')) {
      e.preventDefault();
      e.stopPropagation();
      composerDispatch({ type: 'SET_DRAGGING', payload: false });

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setAttachments([...attachments, ...Array.from(e.dataTransfer.files)]);
        // Open the composer if it's not already open
        if (!composerIsOpen) {
          setComposerIsOpen(true);
        }
      }
    }
  };

  const constructReplyBody = (
    formattedMessage: string,
    originalDate: string,
    originalSender: { name?: string; email?: string } | undefined,
    cleanedToEmail: string,
    quotedMessage?: string,
  ) => {
    return `
      <div style="font-family: Arial, sans-serif;">
        <div style="margin-bottom: 20px;">
          ${formattedMessage}
        </div>
        <div style="padding-left: 1em; margin-top: 1em; border-left: 2px solid #ccc; color: #666;">
          <div style="margin-bottom: 1em;">
            On ${originalDate}, ${originalSender?.name ? `${originalSender.name} ` : ''}${originalSender?.email ? `&lt;${cleanedToEmail}&gt;` : ''} wrote:
          </div>
          <div style="white-space: pre-wrap;">
            ${quotedMessage}
          </div>
        </div>
      </div>
    `;
  };

  const form = useForm<FormData>({
    defaultValues: {
      messageContent: '',
    },
  });

  const handleSendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const originalSubject = emailData[0]?.subject || '';
      const subject = originalSubject.startsWith('Re:')
        ? originalSubject
        : `Re: ${originalSubject}`;

      const originalSender = emailData[0]?.sender;
      const cleanedToEmail = cleanEmailAddress(emailData[emailData.length - 1]?.sender?.email);
      const originalDate = new Date(emailData[0]?.receivedOn || '').toLocaleString();
      const quotedMessage = emailData[0]?.decodedBody;
      const messageId = emailData[0]?.messageId;
      const threadId = emailData[0]?.threadId;

      const formattedMessage = form.getValues('messageContent');

      const replyBody = constructReplyBody(
        formattedMessage,
        originalDate,
        originalSender,
        cleanedToEmail,
        quotedMessage,
      );

      const inReplyTo = messageId;

      const existingRefs = emailData[0]?.references?.split(' ') || [];
      const references = [...existingRefs, emailData[0]?.inReplyTo, cleanEmailAddress(messageId)]
        .filter(Boolean)
        .join(' ');

      await sendEmail({
        to: cleanedToEmail,
        subject,
        message: replyBody,
        attachments,
        headers: {
          'In-Reply-To': inReplyTo ?? '',
          References: references,
          'Thread-Id': threadId ?? '',
        },
      });

      form.reset();
      setComposerIsOpen(false);
      toast.success(t('pages.createEmail.emailSentSuccessfully'));
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(t('pages.createEmail.failedToSendEmail'));
    }
  };

  const toggleComposer = () => {
    setComposerIsOpen(!composerIsOpen);
    if (!composerIsOpen) {
      // Focus will be handled by the useEffect below
    }
  };

  // Add a useEffect to focus the editor when the composer opens
  useEffect(() => {
    if (composerIsOpen) {
      // Give the editor time to render before focusing
      const timer = setTimeout(() => {
        // Focus the editor - Novel editor typically has a ProseMirror element
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement instanceof HTMLElement) {
          editorElement.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [composerIsOpen]);

  // Check if the message is empty
  const isMessageEmpty =
    !form.getValues('messageContent') ||
    form.getValues('messageContent') ===
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      });

  // Check if form is valid for submission
  const isFormValid = !isMessageEmpty || attachments.length > 0;

  const handleAIButtonClick = async () => {
    aiDispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Extract relevant information from the email thread for context
      const latestEmail = emailData[emailData.length - 1];
      const originalSender = latestEmail?.sender?.name || 'the recipient';
      
      // Create a summary of the thread content for context
      const threadContent = emailData
        .map((email) => {
          return `
From: ${email.sender?.name || 'Unknown'} <${email.sender?.email || 'unknown@email.com'}>
Subject: ${email.subject || 'No Subject'}
Date: ${new Date(email.receivedOn || '').toLocaleString()}

${email.decodedBody || 'No content'}
          `;
        })
        .join('\n---\n');

      const suggestion = await generateAIResponse(threadContent, originalSender);
      aiDispatch({ type: 'SET_SUGGESTION', payload: suggestion });
      composerDispatch({ 
        type: 'SET_EDITOR_INITIAL_VALUE', 
        payload: createAIJsonContent(suggestion) 
      });
      composerDispatch({ type: 'INCREMENT_EDITOR_KEY' });
      aiDispatch({ type: 'SET_SHOW_OPTIONS', payload: true });
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      
      let errorMessage = 'Failed to generate AI response. Please try again or compose manually.';
      
      if (error.message) {
        if (error.message.includes('OpenAI API')) {
          errorMessage = 'AI service is currently unavailable. Please try again later.';
        } else if (error.message.includes('key is not configured')) {
          errorMessage = 'AI service is not properly configured. Please contact support.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      aiDispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const acceptAISuggestion = () => {
    if (aiState.suggestion) {
      const jsonContent = createAIJsonContent(aiState.suggestion);
      const htmlContent = convertJSONToHTML(jsonContent);
      
      form.setValue('messageContent', htmlContent);
      
      composerDispatch({ type: 'SET_EDITOR_INITIAL_VALUE', payload: undefined });
      aiDispatch({ type: 'RESET' });
    }
  };

  const rejectAISuggestion = () => {
    composerDispatch({ type: 'SET_EDITOR_INITIAL_VALUE', payload: undefined });
    composerDispatch({ type: 'INCREMENT_EDITOR_KEY' });
    aiDispatch({ type: 'RESET' });
  };

  if (!composerIsOpen) {
    return (
      <div className="bg-offsetLight dark:bg-offsetDark w-full p-2">
        <Button
          onClick={toggleComposer}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md"
          variant="outline"
        >
          <Reply className="h-4 w-4" />
          <span>
            {t('common.replyCompose.replyTo')}{' '}
            {emailData[emailData.length - 1]?.sender?.name || t('common.replyCompose.thisEmail')}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-offsetLight dark:bg-offsetDark w-full p-2">
      <form
        ref={composerRef}
        className={cn(
          'border-border ring-offset-background flex h-fit flex-col space-y-2.5 rounded-[10px] border px-2 py-2 transition-shadow duration-300 ease-in-out',
          composerState.isEditorFocused ? 'ring-2 ring-[#3D3D3D] ring-offset-1' : '',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        onKeyDown={handleKeyDown}
      >
        {composerState.isDragging && (
          <div className="bg-background/80 border-primary/30 absolute inset-0 z-50 m-4 flex items-center justify-center rounded-2xl border-2 border-dashed backdrop-blur-sm">
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <Paperclip className="text-muted-foreground h-12 w-12" />
              <p className="text-lg font-medium">{t('common.replyCompose.dropFiles')}</p>
            </div>
          </div>
        )}

        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Reply className="h-4 w-4" />
            <p className="truncate">
              {emailData[emailData.length - 1]?.sender?.name} (
              {emailData[emailData.length - 1]?.sender?.email})
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              toggleComposer();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {aiState.showOptions && (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-md text-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#016FFE]" />
            <span className="text-[#016FFE] dark:text-[#016FFE]">AI reply suggestion. Review and edit before sending.</span>
          </div>
        )}

        <div className="w-full flex-grow">
          <div className="min-h-[150px] max-h-[800px] w-full overflow-y-auto">
            <Editor
              key={composerState.editorKey}
              onChange={(content) => {
                form.setValue('messageContent', content);
              }}
              initialValue={composerState.editorInitialValue}
              className={cn(
                "sm:max-w-[600px] md:max-w-[2050px]",
                aiState.showOptions ? "border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50/30 dark:bg-blue-950/30 p-1" : ""
              )}
              placeholder={aiState.showOptions ? "AI-generated reply (you can edit)" : "Type your reply here..."}
              onFocus={() => {
                composerDispatch({ type: 'SET_EDITOR_FOCUSED', payload: true });
              }}
              onBlur={() => {
                composerDispatch({ type: 'SET_EDITOR_FOCUSED', payload: false });
              }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            
            {!aiState.showOptions ? (
              <Button 
                variant="outline" 
                className="group relative overflow-hidden transition-all duration-200 w-40"
                onClick={(e) => {
                  e.preventDefault();
                  void handleAIButtonClick();
                }}
                disabled={aiState.isLoading}
              >
                {aiState.isLoading ? (
                  <div className="absolute left-[9px] h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                ) : (
                  <Sparkles className="absolute left-[9px] h-6 w-6" />
                )}
                <span className="whitespace-nowrap pl-5">
                  {aiState.isLoading ? "Generating..." : "Generate Email"}
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    acceptAISuggestion();
                  }}
                >
                  <Check className="h-5 w-5 text-green-500" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    rejectAISuggestion();
                  }}
                >
                  <XIcon className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            )}

            {attachments.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span>
                      {attachments.length}{' '}
                      {t('common.replyCompose.attachmentCount', { count: attachments.length })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 touch-auto" align="start">
                  <div className="space-y-2">
                    <div className="px-1">
                      <h4 className="font-medium leading-none">
                        {t('common.replyCompose.attachments')}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {attachments.length}{' '}
                        {t('common.replyCompose.fileCount', { count: attachments.length })}
                      </p>
                    </div>
                    <Separator />
                    <div className="h-[300px] touch-auto overflow-y-auto overscroll-contain px-1 py-1">
                      <div className="grid grid-cols-2 gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-md border"
                          >
                            <UploadedFileIcon
                              removeAttachment={removeAttachment}
                              index={index}
                              file={file}
                            />
                            <div className="bg-muted/10 p-2">
                              <p className="text-xs font-medium">
                                {truncateFileName(file.name, 20)}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <input
              type="file"
              id="attachment-input"
              className="hidden"
              onChange={handleAttachment}
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
          </div>
          <div className="mr-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8">
              {t('common.replyCompose.saveDraft')}
            </Button>
            <Button
              size="sm"
              className="rounded-full relative h-8 w-8"
              onClick={async (e) => {
                e.preventDefault();
                await handleSendEmail(e);
              }}
              type="button"
            >
              
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
