/**
 * AI Controller
 * Handles AI-powered slide generation using Google Gemini.
 * Enriches slides with Unsplash images after generation.
 * Falls back to mock data when GEMINI_API_KEY is not configured.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildGenerationPrompt, buildSlideActionPrompt, buildSuggestSlidePrompt } = require('../utils/aiPrompts');
const { getValidLayouts } = require('../utils/slideSchemas');
const { attachImagesToSlides, fetchSlideImage } = require('../utils/unsplash');
const Project = require('../models/Project');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if a real Gemini API key is configured.
 */
const hasGeminiKey = () =>
  process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

/**
 * Creates a configured Gemini model instance with deep-content settings.
 */
const getGeminiModel = (mimeType = 'application/json') => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: mimeType,
    },
  });
};

/**
 * Generates a mock presentation when no API key is available.
 */
const generateMockSlides = (topic, slideCount) => {
  const layouts = ['headline', 'standard', 'split', 'cards', 'metrics', 'standard'];

  const mockTemplates = [
    {
      layout: 'headline',
      titleFn: (t) => t,
      subtitle: 'A Comprehensive Overview',
      content: (t) => [`**Core Focus:** Exploring the key aspects of ${t} through research-backed analysis and real-world examples`],
    },
    {
      layout: 'standard',
      titleFn: (t) => `Why ${t} Matters`,
      subtitle: 'Key Drivers',
      content: (t) => [
        `**Industry Adoption:** ${t} is being deployed across Fortune 500 companies with measurable ROI improvements`,
        '**Productivity Gains:** Organizations report 2.5x faster workflows after implementing structured automation pipelines',
        '**Cost Reduction:** Annual operational cost savings average $1.8M for mid-size enterprises adopting modern tooling',
        '**Talent Pipeline:** 73% of engineering teams now require proficiency in this domain for senior-level hiring',
      ],
    },
    {
      layout: 'split',
      titleFn: () => 'Challenges & Risk Factors',
      subtitle: 'Navigating Implementation Barriers',
      content: () => [
        '**Integration Complexity:** Legacy systems require 6-12 month migration cycles with dedicated middleware layers',
        '**Skill Gap:** Only 28% of current workforce has hands-on experience with production-grade implementations',
        '**Data Quality:** Garbage-in-garbage-out remains the primary failure mode for 64% of failed deployments',
        '**Regulatory Compliance:** GDPR, CCPA, and sector-specific regulations add 3-6 months to deployment timelines',
      ],
    },
    {
      layout: 'cards',
      titleFn: () => 'Three Strategic Pillars',
      subtitle: 'Foundation for Sustainable Growth',
      content: () => [
        'Architecture Design',
        '**Modular Microservices:** Build decoupled services with well-defined APIs enabling independent scaling and deployment cycles',
        'Execution Framework',
        '**Iterative Delivery:** Ship incremental value every 2-week sprint using CI/CD pipelines with automated testing gates',
        'Scale Strategy',
        '**Horizontal Auto-Scaling:** Kubernetes orchestration with HPA policies targeting 70% CPU utilization across pod replicas',
      ],
    },
    {
      layout: 'metrics',
      titleFn: () => 'By the Numbers',
      subtitle: 'Key Performance Indicators',
      content: (t) => [
        `87% — Organizations actively planning to adopt ${t} within the next 18 months according to Gartner 2025`,
        '3.5x — Average productivity improvement measured across 200+ enterprise deployments in the last fiscal year',
        '60% — Reduction in manual processes reported after full automation pipeline deployment in Q3 2025',
        '$2.4M — Average annual cost savings per organization based on McKinsey digital transformation study',
      ],
    },
    {
      layout: 'standard',
      titleFn: () => 'Implementation Roadmap',
      subtitle: 'Phased Rollout Strategy',
      content: () => [
        '**Phase 1 — Discovery (Weeks 1-4):** Conduct stakeholder interviews, audit existing infrastructure, define success metrics and KPIs',
        '**Phase 2 — Pilot (Weeks 5-12):** Deploy proof-of-concept with one team, establish monitoring dashboards, gather feedback loops',
        '**Phase 3 — Scale (Weeks 13-24):** Roll out across departments, train power users, integrate with existing CI/CD pipelines',
        '**Phase 4 — Optimize (Ongoing):** A/B test configurations, implement cost governance, establish center of excellence',
      ],
    },
    {
      layout: 'headline',
      titleFn: () => 'Strategic Takeaways',
      subtitle: 'The Path Forward',
      content: () => ['**Bottom Line:** Organizations that invest early in structured implementation see 3x faster time-to-value compared to late adopters'],
    },
  ];

  const slides = [];
  for (let i = 0; i < slideCount; i++) {
    const template = mockTemplates[i % mockTemplates.length];
    slides.push({
      id: `slide-${i + 1}`,
      layout: layouts[i % layouts.length] || 'standard',
      title: typeof template.titleFn === 'function' ? template.titleFn(topic) : topic,
      subtitle: template.subtitle,
      content: typeof template.content === 'function' ? template.content(topic) : template.content,
      theme: 'default',
    });
  }

  return slides;
};

/**
 * Extracts a JSON array from an LLM response string.
 */
const extractJsonArray = (text) => {
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    throw new Error('Could not find a JSON array in the AI response');
  }

  const jsonStr = text.substring(firstBracket, lastBracket + 1);
  return JSON.parse(jsonStr);
};

/**
 * Extracts a JSON object from an LLM response string.
 */
const extractJsonObject = (text) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Could not find a JSON object in the AI response');
  }

  const jsonStr = text.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonStr);
};

/**
 * Validates and normalizes an array of slide objects.
 * Preserves unsplashQuery and image fields for Unsplash pipeline.
 */
const validateSlides = (slides) => {
  const validLayouts = getValidLayouts();

  return slides.map((slide, i) => ({
    id: slide.id || `slide-${i + 1}`,
    layout: validLayouts.includes(slide.layout) ? slide.layout : 'standard',
    title: typeof slide.title === 'string' ? slide.title : `Slide ${i + 1}`,
    subtitle: typeof slide.subtitle === 'string' ? slide.subtitle : '',
    content: Array.isArray(slide.content) ? slide.content.map(String) : [],
    theme: 'default',
    unsplashQuery: typeof slide.unsplashQuery === 'string' ? slide.unsplashQuery : '',
  }));
};

/**
 * Validates and normalizes a single slide object.
 */
const validateSingleSlide = (slide) => {
  const validLayouts = getValidLayouts();
  return {
    layout: validLayouts.includes(slide.layout) ? slide.layout : 'standard',
    title: typeof slide.title === 'string' ? slide.title : 'Untitled',
    subtitle: typeof slide.subtitle === 'string' ? slide.subtitle : '',
    content: Array.isArray(slide.content) ? slide.content.map(String) : [],
    unsplashQuery: typeof slide.unsplashQuery === 'string' ? slide.unsplashQuery : '',
    image: slide.image || null,
  };
};

// ─── Controller Methods ───────────────────────────────────────────────────────

/**
 * POST /api/ai/generate
 * Generates a full presentation using Google Gemini (or mock data).
 * Enriches slides with Unsplash images after generation.
 * Requires authentication — saves project to the user's account.
 *
 * Body: { topic: string, slideCount?: number, style?: string }
 */
const generatePresentation = async (req, res, next) => {
  try {
    const { topic, slideCount = 8, style = 'professional' } = req.body;

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      const error = new Error('A non-empty "topic" string is required');
      error.statusCode = 400;
      throw error;
    }

    const count = Math.min(Math.max(parseInt(slideCount, 10) || 8, 1), 20);
    const trimmedTopic = topic.trim();

    console.log(`[AI] Generating ${count} slides for: "${trimmedTopic}" (style: ${style}) — user: ${req.user.email}`);

    let slides;

    // Attempt Gemini generation
    if (hasGeminiKey()) {
      try {
        const model = getGeminiModel();

        const systemPrompt = buildGenerationPrompt(count, style);
        const userPrompt = `Create a deeply researched, expert-level presentation about: ${trimmedTopic}

Requirements:
- Exactly ${count} slides
- Every bullet point must follow **Bold Lead-In:** format with 15-25 words of substance
- Include real names, real numbers, real examples — no generic filler
- Each slide needs a unique "unsplashQuery" for fetching relevant imagery`;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        });

        const responseText = result.response.text();
        console.log('[AI] Gemini response received, parsing JSON...');

        const rawSlides = extractJsonArray(responseText);
        slides = validateSlides(rawSlides);

        console.log(`[AI] Successfully parsed ${slides.length} slides from Gemini`);

        // Fetch Unsplash images concurrently
        slides = await attachImagesToSlides(slides);

      } catch (aiError) {
        console.error(`[AI] Gemini API error: ${aiError.message}`);
        console.log('[AI] Falling back to mock data...');
        slides = generateMockSlides(trimmedTopic, count);
      }
    } else {
      console.log('[AI] No GEMINI_API_KEY set — using mock data');
      slides = generateMockSlides(trimmedTopic, count);
    }

    // Save to MongoDB
    const project = await Project.create({
      title: trimmedTopic,
      user: req.user._id,
      slides,
    });

    console.log(`[AI] Project saved: "${project.title}" (${project.id})`);

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/slide-action
 * Performs an AI action on a single slide (polish, expand, condense, metrics, custom).
 *
 * Body: {
 *   slide: { title, subtitle, content, layout },
 *   action: 'polish' | 'expand' | 'condense' | 'metrics' | 'custom',
 *   customPrompt?: string,
 *   projectId: string
 * }
 */
const slideAction = async (req, res, next) => {
  try {
    const { slide, action, customPrompt, projectId } = req.body;

    // Validate
    const validActions = ['polish', 'expand', 'condense', 'metrics', 'custom'];
    if (!slide || !action || !validActions.includes(action)) {
      const error = new Error(`Invalid request. "action" must be one of: ${validActions.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (action === 'custom' && (!customPrompt || !customPrompt.trim())) {
      const error = new Error('"customPrompt" is required for custom actions');
      error.statusCode = 400;
      throw error;
    }

    console.log(`[AI] Slide action "${action}" on: "${slide.title}" — user: ${req.user.email}`);

    if (!hasGeminiKey()) {
      // Mock fallback — return the slide with minor mock modifications
      const mockResult = { ...slide };
      if (action === 'polish') {
        mockResult.title = `${slide.title} (Polished)`;
      } else if (action === 'expand') {
        mockResult.content = [...(slide.content || []), '**Additional Detail:** AI-generated expansion with concrete supporting evidence and metrics', '**Extended Analysis:** Another expanded point providing deeper domain-specific context'];
      } else if (action === 'condense') {
        mockResult.content = (slide.content || []).slice(0, 3);
      } else if (action === 'metrics') {
        mockResult.layout = 'metrics';
        mockResult.content = ['87% — Key metric extracted from content analysis across enterprise deployments', '3.2x — Performance improvement measured in controlled A/B testing environments', '45% — Efficiency gain reported after full pipeline automation rollout'];
      }

      return res.json({ success: true, data: validateSingleSlide(mockResult) });
    }

    // Real Gemini call
    const model = getGeminiModel();
    const targetLayout = action === 'metrics' ? 'metrics' : (slide.layout || 'standard');
    const systemPrompt = buildSlideActionPrompt(action, targetLayout);

    let userMessage = `Here is the current slide:\n${JSON.stringify(slide, null, 2)}`;
    if (action === 'custom' && customPrompt) {
      userMessage += `\n\nUser's instruction: ${customPrompt.trim()}`;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text();
    console.log(`[AI] Slide action "${action}" response received, parsing...`);

    const rawSlide = extractJsonObject(responseText);
    const validated = validateSingleSlide(rawSlide);

    console.log(`[AI] Slide action "${action}" completed successfully`);

    res.json({ success: true, data: validated });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/suggest-slide
 * Suggests the next slide based on existing slides context.
 *
 * Body: {
 *   slides: [ { title, subtitle, content, layout }, ... ],
 *   projectId: string
 * }
 */
const suggestSlide = async (req, res, next) => {
  try {
    const { slides, projectId } = req.body;

    if (!Array.isArray(slides) || slides.length === 0) {
      const error = new Error('"slides" array with at least one slide is required');
      error.statusCode = 400;
      throw error;
    }

    console.log(`[AI] Suggesting next slide (${slides.length} existing) — user: ${req.user.email}`);

    if (!hasGeminiKey()) {
      // Mock fallback
      const mockSlide = {
        layout: 'standard',
        title: 'Suggested Next Slide',
        subtitle: 'AI-generated continuation',
        content: [
          '**Mock Notice:** This is a placeholder since no Gemini API key is configured in the server environment',
          '**Setup Required:** Add your GEMINI_API_KEY to server/.env for real AI-powered slide suggestions',
          '**AI Capability:** The model analyzes your existing slide context to generate topically coherent continuations',
        ],
      };
      return res.json({ success: true, data: mockSlide });
    }

    // Real Gemini call
    const model = getGeminiModel();
    const systemPrompt = buildSuggestSlidePrompt(slides.length);

    // Send condensed context of existing slides
    const contextSlides = slides.map((s, i) => ({
      position: i + 1,
      layout: s.layout,
      title: s.title,
      content_preview: (s.content || []).slice(0, 3),
    }));

    const userMessage = `Here are the existing slides in the presentation:\n${JSON.stringify(contextSlides, null, 2)}\n\nGenerate the next logical slide with deep, expert-level content. Every bullet must use **Bold Lead-In:** format.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text();
    console.log('[AI] Suggest-slide response received, parsing...');

    const rawSlide = extractJsonObject(responseText);
    const validated = validateSingleSlide(rawSlide);

    // Fetch Unsplash image for the suggested slide
    try {
      const query = validated.unsplashQuery || validated.title || 'technology background';
      validated.image = await fetchSlideImage(query);
    } catch (imgErr) {
      console.warn('[AI] Unsplash fetch for suggested slide failed:', imgErr.message);
    }

    console.log(`[AI] Suggested slide: "${validated.title}" (${validated.layout})`);

    res.json({ success: true, data: validated });
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePresentation, slideAction, suggestSlide };
