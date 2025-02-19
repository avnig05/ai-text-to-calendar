"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/app/components/ui/card";
import { GeneratedEventDisplay } from "./generated-event";
import { CalendarEvent } from "@/app/types/CalendarEvent";
import { generateEventFromText } from "@/app/utils/eventGenerator";
import { generateEventFromImage } from "@/app/utils/eventGeneratorImage";

// Main converter component uses local sub-components for layout, icons, etc.
export function CalendarConverter() {
	const [text, setText] = useState("");
	const [generatedEvent, setGeneratedEvent] = useState<CalendarEvent | null>(
		null
	);
	const [buttonLabel, setButtonLabel] = useState("Convert to Calendar Event");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);

	const handleConvert = async () => {
		try {
			setButtonLabel("Converting...");
			let event = null;
			if (file === null) {
				event = await generateEventFromText(text);
			} else {
				event = await generateEventFromImage(file);
			}
			setGeneratedEvent(event);
			setButtonLabel("Convert to Calendar Event");
		} catch (error) {
			console.error("Error generating event:", error);
		}
	};

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file_uploaded = event.target.files?.[0];
		if (file_uploaded) {
			setFile(file_uploaded);
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const file_uploaded = e.dataTransfer.files?.[0];
		if (file_uploaded) {
			setFile(file_uploaded);
		}
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
						accept=".png, .jpeg"
						title="Upload a text file"
					/>
					<FileUploadZone
						onClick={() => fileInputRef.current?.click()}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					/>
					<Textarea
						placeholder="Or type your text here..."
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="min-h-[100px] text-telegraf border-[#A5C3C2] focus:border-[#218F98] bg-white/95 placeholder:text-[#6B909F] text-[#071E37]"
					/>
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

/* Local sub-components in the same file */

// Layout container
function Container({ children }: { children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
			{children}
		</section>
	);
}

// Corner sparkles
function Sparkle({ position }: { position: "left" | "right" }) {
	const side = position === "left" ? "left-4" : "right-4";
	return (
		<div className={`absolute top-4 ${side}`}>
			<span className="text-[#218F98] text-xl">✧</span>
		</div>
	);
}

// Logo box
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

// Inner dot circles
function Dot() {
	return (
		<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-[#218F98] bg-white -mt-1" />
	);
}

// Small tagline
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

// Hidden file input
const HiddenFileInput = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
	<input ref={ref} type="file" className="hidden" {...props} />
));
HiddenFileInput.displayName = "HiddenFileInput";

// Drop zone area
interface FileUploadZoneProps {
	onClick: () => void;
	onDragOver: (e: DragEvent) => void;
	onDrop: (e: DragEvent) => void;
}
function FileUploadZone({ onClick, onDragOver, onDrop }: FileUploadZoneProps) {
	return (
		<div
			onClick={onClick}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className="border-2 border-dashed border-[#218F98] rounded-lg p-12 text-center cursor-pointer hover:bg-[#218F98]/5 transition-colors"
		>
			<div className="flex flex-col items-center gap-2">
				<UploadIcon />
				<p className="text-sm text-telegraf text-[#6B909F]">
					Drag and drop a text file here, or click to select a file
				</p>
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
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 
           01-2-2V5a2 2 0 012-2h5.586
           a1 1 0 01.707.293l5.414 5.414
           a1 1 0 01.293.707V19a2 2 0 
           01-2 2z"
			/>
		</svg>
	);
}
