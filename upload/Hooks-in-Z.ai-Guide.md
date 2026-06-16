# Hooks in Z.ai — Complete Guide

> A practical guide to using React Hooks and hook patterns in the Z.ai environment for building AI-integrated applications.
> verified_by: scripts/verify-standards.js#V03 (API routes use Zod safeParse), scripts/verify-standards.js#V04 (no emoji/Unicode graphic chars), scripts/verify-standards.js#V08 (code fences have language tag), scripts/verify-standards.js#V09 (English-only)

---

## Table of Contents

1. [Introduction to Hooks](#introduction-to-hooks)
2. [Basic React Hooks](#basic-react-hooks)
3. [Custom AI Hooks](#custom-ai-hooks)
4. [API Routes for AI Integration](#api-routes-for-ai-integration)
5. [Middleware Hooks](#middleware-hooks)
6. [Practical Cases](#practical-cases)
7. [Best Practices](#best-practices)
8. [Project Structure](#project-structure)

---

## Introduction to Hooks

**Hooks** are functions that let you "hook into" React component state and lifecycle features from functional components. In the Z.ai context, hooks become a powerful tool for integrating AI capabilities into web applications.

### Benefits of Using Hooks in Z.ai

| Benefit | Description |
|---------|-------------|
| Logic reuse | Build custom hooks for common AI operations |
| Clean code | Separate logic from presentation |
| Testability | Hooks are easy to test in isolation |
| Performance | Memoization via `useCallback` and `useMemo` |
| State management | Simple and predictable state management |

---

## Basic React Hooks

### useState

Manage local component state:

```typescript
const [value, setValue] = useState<T>(initialValue);
```

### useEffect

Side effects (API requests, subscriptions):

```typescript
useEffect(() => {
  // Runs on mount and when dependencies change

  return () => {
    // Cleanup function (analog of componentWillUnmount)
  };
}, [dependencies]);
```

### useCallback

Memoize functions to prevent unnecessary re-renders:

```typescript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo

Memoize computed values:

```typescript
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
```

### useRef

Hold mutable values without triggering re-renders:

```typescript
const containerRef = useRef<HTMLDivElement>(null);
const previousValue = useRef<T>(value);
```

---

## Custom AI Hooks

### useAI — Text Generation Hook

```typescript
// hooks/useAI.ts
import { useState, useCallback } from 'react';

interface UseAIOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface UseAIReturn {
  generate: (prompt: string) => Promise<string>;
  loading: boolean;
  error: Error | null;
  response: string;
  reset: () => void;
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string>('');

  const generate = useCallback(async (prompt: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: options.systemPrompt,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        })
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.content);
      return data.content;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options.systemPrompt, options.temperature, options.maxTokens]);

  const reset = useCallback(() => {
    setResponse('');
    setError(null);
    setLoading(false);
  }, []);

  return { generate, loading, error, response, reset };
}
```

### useImageGeneration — Image Generation Hook

```typescript
// hooks/useImageGeneration.ts
import { useState, useCallback } from 'react';

type ImageSize = '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440';

interface UseImageGenerationReturn {
  generateImage: (prompt: string, size?: ImageSize) => Promise<string>;
  generating: boolean;
  imageUrl: string | null;
  error: Error | null;
  clear: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generateImage = useCallback(async (
    prompt: string,
    size: ImageSize = '1024x1024'
  ): Promise<string> => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size })
      });

      if (!res.ok) {
        throw new Error(`Image API Error: ${res.status}`);
      }

      const data = await res.json();
      const url = `data:image/png;base64,${data.imageBase64}`;
      setImageUrl(url);
      return url;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  const clear = useCallback(() => {
    setImageUrl(null);
    setError(null);
  }, []);

  return { generateImage, generating, imageUrl, error, clear };
}
```

### useChat — Chat Hook with History

```typescript
// hooks/useChat.ts
import { useState, useCallback, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  systemPrompt?: string;
  maxHistory?: number;
}

interface UseChatReturn {
  messages: Message[];
  send: (content: string) => Promise<string>;
  loading: boolean;
  error: Error | null;
  cancel: () => void;
  clear: () => void;
  regenerate: () => Promise<string>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const send = useCallback(async (content: string): Promise<string> => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: options.systemPrompt
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      return data.content;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages, options.systemPrompt]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const regenerate = useCallback(async (): Promise<string> => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message to regenerate');
    }

    // Remove the last assistant response
    setMessages(prev => prev.slice(0, -1));

    // Resend
    return send(lastUserMessage.content);
  }, [messages, send]);

  return { messages, send, loading, error, cancel, clear, regenerate };
}
```

### useAutoSave — Auto-Save Hook

```typescript
// hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  delay?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>({
  data,
  saveFunction,
  delay = 2000,
  onSave,
  onError
}: UseAutoSaveOptions<T>): {
  saveNow: () => Promise<void>;
  isSaving: boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<string>(JSON.stringify(data));
  const isSavingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    try {
      await saveFunction(data);
      prevDataRef.current = JSON.stringify(data);
      onSave?.();
    } catch (err) {
      onError?.(err as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, saveFunction, onSave, onError]);

  useEffect(() => {
    const currentData = JSON.stringify(data);

    if (currentData === prevDataRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(performSave, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, performSave]);

  return {
    saveNow: performSave,
    get isSaving() {
      return isSavingRef.current;
    }
  };
}
```

### useDebounce — Debounced Value Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearch = useDebounce(searchTerm, 300);
//
// useEffect(() => {
//   if (debouncedSearch) {
//     searchAPI(debouncedSearch);
//   }
// }, [debouncedSearch]);
```

---

## API Routes for AI Integration

### Chat API Route

```typescript
// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ZAI from 'z-ai-web-dev-sdk';

// STD-FE-001 Section 10.3: Zod input validation
const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
  systemPrompt: z.string().max(2000).optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().min(1).max(4096).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = ChatRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: result.error.errors } },
        { status: 400 }
      );
    }

    const { prompt, history, systemPrompt, temperature, maxTokens } = result.data;

    const zai = await ZAI.create();

    const messages = [
      { role: 'system' as const, content: systemPrompt || 'You are a helpful assistant.' },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: prompt }
    ];

    const completion = await zai.chat.completions.create({
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ success: true, data: { content } });
  } catch (error: any) {
    console.error('Chat API Error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
```

### Image Generation API Route

```typescript
// app/api/ai/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ZAI from 'z-ai-web-dev-sdk';

// STD-FE-001 Section 10.3: Zod input validation
const ImageRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.enum([
    '1024x1024', '768x1344', '864x1152',
    '1344x768', '1152x864', '1440x720', '720x1440'
  ]).optional().default('1024x1024'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = ImageRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: result.error.errors } },
        { status: 400 }
      );
    }

    const { prompt, size } = result.data;

    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt,
      size
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: { code: 'GENERATION_ERROR', message: 'No image generated' } },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: { imageBase64 } });
  } catch (error: any) {
    console.error('Image API Error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
```

### Web Search API Route

```typescript
// app/api/ai/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ZAI from 'z-ai-web-dev-sdk';

// STD-FE-001 Section 10.3: Zod input validation
const SearchRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  num: z.number().int().min(1).max(50).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = SearchRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: result.error.errors } },
        { status: 400 }
      );
    }

    const { query, num } = result.data;

    const zai = await ZAI.create();

    const searchResult = await zai.functions.invoke('web_search', {
      query,
      num
    });

    return NextResponse.json({ success: true, data: { results: searchResult } });
  } catch (error: any) {
    console.error('Search API Error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
```

---

## Middleware Hooks

### Logging and Monitoring

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Pre-hook: log the incoming request
  console.log(`[${requestId}] -> ${request.method} ${request.url}`);

  // Attach requestId for tracing
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Post-hook: log processing time
  const duration = Date.now() - start;
  response.headers.set('x-response-time', `${duration}ms`);

  console.log(`[${requestId}] <- ${response.status} (${duration}ms)`);

  return response;
}

export const config = {
  matcher: '/api/:path*'
};
```

### Rate Limiting Hook

```typescript
// lib/rateLimiter.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}
```

---

## Practical Cases

### Case 1: AI Assistant with History Persistence

```typescript
// app/chat/page.tsx
'use client';

import { useChat } from '@/hooks/useChat';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useState, useEffect } from 'react';

interface ChatSession {
  id: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function ChatPage() {
  const { messages, send, loading, error, clear } = useChat({
    systemPrompt: 'You are a helpful AI assistant. Answer briefly and to the point.'
  });

  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());

  // Auto-save the session
  useAutoSave({
    data: { id: sessionId, messages, updatedAt: new Date() },
    saveFunction: async (data) => {
      await fetch(`/api/sessions/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delay: 3000,
    onSave: () => console.log('Session saved'),
    onError: (err) => console.error('Save failed:', err)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await send(input);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

      <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-xs'
                : 'bg-gray-100 max-w-xs'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500">Typing...</div>}
      </div>

      {error && (
        <div className="text-red-500 mb-2">Error: {error.message}</div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Type a message..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <button
        onClick={clear}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Clear chat
      </button>
    </div>
  );
}
```

### Case 2: Content Generator

```typescript
// app/generator/page.tsx
'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useImageGeneration } from '@/hooks/useImageGeneration';

type ContentType = 'post' | 'article' | 'ad' | 'story';

const PROMPTS: Record<ContentType, string> = {
  post: 'Write an engaging social media post about:',
  article: 'Write an article outline about:',
  ad: 'Create ad copy for the product:',
  story: 'Craft a brand story for:'
};

export default function GeneratorPage() {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [topic, setTopic] = useState('');

  const { generate: generateText, loading: textLoading, response } = useAI();
  const { generateImage, generating: imageGenerating, imageUrl } = useImageGeneration();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const fullPrompt = `${PROMPTS[contentType]} "${topic}"`;
    const text = await generateText(fullPrompt);

    if (text) {
      // Generate an image based on the text
      const imagePrompt = `Illustration for ${contentType}: ${text.substring(0, 100)}`;
      await generateImage(imagePrompt);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Content Generator</h1>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['post', 'article', 'ad', 'story'] as ContentType[]).map((type) => (
          <button
            key={type}
            onClick={() => setContentType(type)}
            className={`p-2 rounded-lg border capitalize ${
              contentType === type
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full border rounded-lg p-4 mb-4 h-32"
        placeholder="Describe the topic or enter keywords..."
      />

      <button
        onClick={handleGenerate}
        disabled={textLoading || imageGenerating || !topic.trim()}
        className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 mb-6"
      >
        {textLoading ? 'Generating text...' :
         imageGenerating ? 'Generating image...' :
         'Generate'}
      </button>

      {response && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-2">Generated text:</h2>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {imageUrl && (
        <div className="rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Generated" className="w-full" />
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Separation of Concerns

```text
[OK] Good: One hook — one responsibility
[FAIL] Bad: A huge hook that does everything

// [OK] Good
const { data } = useFetch(url);
const { save } = useAutoSave(data);

// [FAIL] Bad
const { data, save, loading, error, ... } = useEverything();
```

### 2. Correct Dependencies in useCallback/useMemo

```typescript
// [OK] Good — all dependencies are listed
const handleSubmit = useCallback(async (data: FormData) => {
  await submitForm(data);
  refreshList(); // depends on refreshList
}, [submitForm, refreshList]);

// [FAIL] Bad — missing dependencies
const handleSubmit = useCallback(async (data: FormData) => {
  await submitForm(data);
  refreshList(); // refreshList is not in deps!
}, [submitForm]);
```

### 3. Error Handling

```typescript
// [OK] Good — full handling
const { generate, error, loading } = useAI();

const handleGenerate = async () => {
  try {
    const result = await generate(prompt);
    // Success handling
  } catch (err) {
    // Error is already in error state
    console.error('Generation failed:', err);
  }
};

// [FAIL] Bad — no handling
const handleGenerate = async () => {
  const result = await generate(prompt); // May throw
};
```

### 4. Request Cancellation

```typescript
// [OK] Good — AbortController support
const abortRef = useRef<AbortController | null>(null);

const fetch = async () => {
  abortRef.current = new AbortController();
  try {
    await fetch(url, { signal: abortRef.current.signal });
  } catch (err) {
    if (err.name !== 'AbortError') {
      // Handle the real error
    }
  }
};

const cancel = () => {
  abortRef.current?.abort();
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    abortRef.current?.abort();
  };
}, []);
```

### 5. Typing

```typescript
// [OK] Good — full typing
interface User {
  id: string;
  name: string;
}

function useUser(id: string): {
  user: User | null;
  loading: boolean;
  error: Error | null;
} {
  // ...
}

// [FAIL] Bad — any types
function useUser(id: string): any {
  // ...
}
```

---

## Project Structure

```text
project/
├── app/
│   ├── api/
│   │   └── ai/
│   │       ├── chat/route.ts        # Chat API
│   │       ├── image/route.ts       # Image generation API
│   │       └── search/route.ts      # Web search API
│   ├── chat/page.tsx                # Chat interface
│   ├── generator/page.tsx           # Content generator
│   └── layout.tsx
├── hooks/
│   ├── useAI.ts                     # Text generation hook
│   ├── useImageGeneration.ts        # Image generation hook
│   ├── useChat.ts                   # Chat with history hook
│   ├── useAutoSave.ts               # Auto-save hook
│   ├── useDebounce.ts               # Debounce utility hook
│   └── useFetch.ts                  # Data fetching hook
├── lib/
│   ├── ai-client.ts                 # AI client utilities
│   ├── rateLimiter.ts               # Rate limiting
│   └── validators.ts                # Input validation
├── types/
│   └── ai.ts                        # AI-related types
└── middleware.ts                    # Global middleware hooks
```

---

## Quick Reference

| Task | Hook | Usage Example |
|--------|-----|---------------------|
| Text generation | `useAI` | `const { generate } = useAI()` |
| Image generation | `useImageGeneration` | `const { generateImage } = useImageGeneration()` |
| Chat with history | `useChat` | `const { messages, send } = useChat()` |
| Auto-save | `useAutoSave` | `useAutoSave({ data, saveFunction })` |
| Debounced value | `useDebounce` | `const debounced = useDebounce(value, 300)` |
| Request cancellation | `AbortController` | `controller.abort()` |

---

## Conclusion

Hooks in Z.ai are a powerful tool for building AI-integrated applications. By following the patterns and practices presented here, you can write clean, maintainable, and performant code.

### Key Principles:

1. **Modularity** — each hook owns a single responsibility
2. **Reuse** — extract shared logic into custom hooks
3. **Typing** — use TypeScript for safety
4. **Error handling** — always provide a fallback
5. **Performance** — memoize functions and values

---

*Document created for the Z.ai environment*
