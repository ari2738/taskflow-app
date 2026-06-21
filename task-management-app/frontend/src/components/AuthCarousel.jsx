import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Zap,
  BarChart3,
  Shield,
  LayoutGrid,
  Tag,
  Calendar,
  Sparkles,
  MessageCircle,
  Target,
} from "lucide-react";

const slides = [
  {
    title: "Manage tasks",
    titleHighlight: "like a pro.",
    description:
      "AI-powered task management with Kanban boards, smart suggestions, and real-time insights.",
    features: [
      { Icon: Zap, text: "AI-powered task suggestions" },
      { Icon: BarChart3, text: "Real-time productivity insights" },
      { Icon: Shield, text: "Secure JWT authentication" },
    ],
  },
  {
    title: "Stay organized",
    titleHighlight: "effortlessly.",
    description:
      "Keep every task in order with boards, tags, and deadlines that actually keep up with you.",
    features: [
      { Icon: LayoutGrid, text: "Kanban-style boards" },
      { Icon: Tag, text: "Priority & category tags" },
      { Icon: Calendar, text: "Due date tracking" },
    ],
  },
  {
    title: "Powered by",
    titleHighlight: "AI.",
    description:
      "Let AI handle the busywork — from writing task descriptions to suggesting what to do next.",
    features: [
      { Icon: Sparkles, text: "Smart task descriptions" },
      { Icon: MessageCircle, text: "AI chatbot assistant" },
      { Icon: Target, text: "Productivity tips on demand" },
    ],
  },
];

const SLIDE_DURATION = 4000;

export default function AuthCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const current = slides[activeIndex];

  return (
    <div className="auth-left">
      <div className="auth-left-logo">
        <div className="auth-left-logo-icon">
          <CheckSquare size={22} />
        </div>
        <span>TaskFlow</span>
      </div>

      <div key={activeIndex} style={{ animation: "authCarouselFadeIn 0.5s ease" }}>
        <h1>
          {current.title}
          <br />
          {current.titleHighlight}
        </h1>
        <p>{current.description}</p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 40,
            position: "relative",
            zIndex: 1,
          }}
        >
          {current.features.map(({ Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color="#fff" />
              </div>
              <span style={{ color: "rgba(255,255,255,.85)", fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 40, position: "relative", zIndex: 1 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: index === activeIndex ? 28 : 8,
              height: 8,
              borderRadius: 999,
              border: "none",
              background: index === activeIndex ? "#fff" : "rgba(255,255,255,.4)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes authCarouselFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
