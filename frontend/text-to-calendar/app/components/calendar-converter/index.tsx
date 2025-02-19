"use client";

import React, {
  useState,
  useRef,
  useCallback,
  DragEvent,
  ChangeEvent,
} from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { GeneratedEventDisplay } from "./generated-event";
import { CalendarEvent } from "@/app/types/CalendarEvent";
import { generateEventFromText, generateEventFromImage } from "@/app/utils/eventGenerator";
import mammoth from "mammoth";

/**
 * CalendarConverter
 * Processes text, images, and .docx files to generate a calendar event.
 */
export function CalendarConverter() {
  const [text, setText] = useState("");
  const [generatedEvent, setGeneratedEvent] = useState<CalendarEvent | null>(null);
  const [buttonLabel, setButtonLabel] = useState("Convert to Calendar Event");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);

  /**
   * Handles the core conversion logic, detecting whether to convert text or image.
   */
  const handleConvert = useCallback(async () => {
    setButtonLabel("Converting...");
    try {
      let event: CalendarEvent | null = null;
      if (file && file.type.startsWith("image/")) {
        event = await generateEventFromImage(file);
      } else {
        // Includes .docx and .txt, or no file at all
        event = await generateEventFromText(text);
      }
      setGeneratedEvent(event);
    } catch (error) {
      console.error("Error generating event:", error);
    } finally {
      setButtonLabel("Convert to Calendar Event");
    }
  }, [file, text]);

  /**
   * Reads and sets the text from a .txt or .docx file.
   */
  const readTextFromFile = useCallback(async (uploadedFile: File) => {
    if (uploadedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText((e.target?.result as string) || "");
      };
      reader.readAsText(uploadedFile);
    } else if (
      uploadedFile.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Use mammoth to extract text from .docx
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  }, []);

  /**
   * Sets file state and reads text if necessary (.txt or .docx).
   */
  const handleFileSelection = useCallback(
    async (uploadedFile: File) => {
      setFile(uploadedFile);
      setFileURL(URL.createObjectURL(uploadedFile));
      // Read text if it's .txt or .docx
      if (
        uploadedFile.type === "text/plain" ||
        uploadedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        await readTextFromFile(uploadedFile);
      }
    },
    [readTextFromFile]
  );

  /**
   * File input change handler for manual selection.
   */
  const handleFileUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0];
      if (uploadedFile) {
        await handleFileSelection(uploadedFile);
      }
    },
    [handleFileSelection]
  );

  /**
   * Drag over handler to allow file dropping.
   */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Drop handler that processes the dropped file.
   */
  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        await handleFileSelection(droppedFile);
      }
    },
    [handleFileSelection]
  );

  /**
   * Textarea change handler for manual text input.
   */
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <Container>
      <Card className="w-full border-[#218F98] bg-white/95 shadow-sm relative">
        <Sparkle position="left" />
        <Sparkle position="right" />
        <CardHeader className="relative px-4 sm:px-8 pt-8">
          <Logo />
          <CardTitle className="text-center heading-signika text-[1.2rem] xs:text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#071E37] tracking-[0.1em] xs:tracking-[0.12em] sm:tracking-[0.15em] font-light uppercase">
            Calendarize
          </CardTitle>
          <Tagline />
        </CardHeader>
        <CardContent className="space-y-6">
          <HiddenFileInput
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".png, .jpeg, .jpg, .txt, .docx"
            title="Upload a text, image, or document file"
          />
          <FileUploadZone
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            fileURL={fileURL}
          />
          <div className="relative">
            <textarea
              placeholder="Enter event details (date, time, topic, description) for better results."
              value={text}
              onChange={handleTextareaChange}
              className="min-h-[100px] text-telegraf border-2 border-[#A5C3C2] focus:border-[#218F98] bg-white/95 placeholder:text-[#6B909F] text-[#071E37] w-full rounded-lg max-h-40 overflow-y-auto"
            />
          </div>
          <Button
            onClick={handleConvert}
            className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-sm sm:text-base py-2"
          >
            {buttonLabel}
          </Button>
        </CardContent>
      </Card>

      {generatedEvent && (
        <Card className="w-full border-[#218F98] bg-white/95 shadow-sm relative">
          <Sparkle position="right" />
          <GeneratedEventDisplay event={generatedEvent} />
        </Card>
      )}
    </Container>
  );
}

/* ----------------- LOCAL SUB-COMPONENTS ----------------- */

// Main layout container
function Container({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {children}
    </section>
  );
}

// Decorative sparkles
function Sparkle({ position }: { position: "left" | "right" }) {
  const sideClass = position === "left" ? "left-4" : "right-4";
  return (
    <div className={`absolute top-4 ${sideClass}`}>
      <span className="text-[#218F98] text-xl">✧</span>
    </div>
  );
}

// Logo block
function Logo() {
  return (
    <div className="flex justify-center mb-3">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#218F98] rounded-lg relative flex items-center justify-center">
        <span className="text-[#218F98] text-xl sm:text-2xl font-light heading-signika">
          CZ
        </span>
        <div className="absolute -top-1 left-2 right-2 sm:left-3 sm:right-3 h-1 bg-white flex justify-between">
          <Dot />
          <Dot />
        </div>
      </div>
    </div>
  );
}

// Dot used in the Logo
function Dot() {
  return (
    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-[#218F98] bg-white -mt-1" />
  );
}

// Tagline under the title
function Tagline() {
  return (
    <div className="text-center text-telegraf text-[#6B909F] mt-1 space-y-0.5">
      <p className="tracking-wide text-[0.7rem] xs:text-[0.8rem] sm:text-xs uppercase">
        Effortless Scheduling.
      </p>
      <p className="tracking-wide text-[0.7rem] xs:text-[0.8rem] sm:text-xs uppercase">
        Instant Planning.
      </p>
    </div>
  );
}

// Hidden file input for user-triggered uploads
const HiddenFileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} type="file" className="hidden" {...props} />);
HiddenFileInput.displayName = "HiddenFileInput";

// Props for the file upload zone
interface FileUploadZoneProps {
  onClick: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  fileURL: string | null;
}

// Drop zone with optional file preview
function FileUploadZone({ onClick, onDragOver, onDrop, fileURL }: FileUploadZoneProps) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="border-2 border-dashed border-[#218F98] rounded-lg p-12 text-center cursor-pointer hover:bg-[#218F98]/5 transition-colors"
    >
      <div className="flex flex-col items-center gap-4">
        <UploadIcon />
        <p className="text-sm text-telegraf text-[#6B909F]">
          Drag and drop a text, image, or document file here, or click to select a file
        </p>
        {fileURL && (
          <div className="mt-4 w-full max-w-lg mx-auto border-2 border-[#218F98] rounded-lg overflow-hidden bg-white/95 shadow-md">
            <div className="relative w-full h-0 pb-[75%] p-2">
              {/* next/image preview for images; docx/txt won't preview actual content */}
              <div className="absolute inset-0 m-2 border-2 border-[#A5C3C2] rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={fileURL}
                  alt={
                    /\.(png|jpe?g)$/i.test(fileURL)
                      ? "Uploaded file preview"
                      : "File preview not available"
                  }
                  layout="fill"
                  objectFit="contain"
                  className="p-1 hover:scale-[1.02] transition-transform duration-200 text-[#218F98] text-telegraf text-xl sm:text-2xl font-light tracking-wide"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Upload icon
function UploadIcon() {
  return (
    <svg
      className="h-8 w-8 text-[#218F98]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2
           0 01-2-2V5a2 2 0 012-2h5.586
           a1 1 0 01.707.293l5.414 5.414
           a1 1 0 01.293.707V19a2 2 0
           01-2 2z"
      />
    </svg>
  );
}
