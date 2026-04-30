- What did you build and why? What did you deliberately cut?
    

    I built a conversational car advisor — a ChatGPT-style interface where Indian buyers describe their needs in plain language and get a ranked shortlist of 3 cars with reasoning.
    
    I chose this format deliberately. Filter UIs already exist on every car platform. The real problem isn't filtering — it's that buyers don't know what criteria matter for their situation. A conversation surfaces that naturally.
    
    What I cut:
    - Mobile-responsive polish — the core buying flow works on desktop, responsiveness was a nice-to-have not a must-have for the MVP
    - Full 50-car dataset — free AI models have token limits, so I used 25 carefully selected cars covering all major segments (hatchback, sedan, SUV, EV, MUV) across budget ranges. The recommendation quality matters more than dataset size.
    - Comparison view — useful but secondary to getting the shortlist right first
    
    
- What’s your tech stack and why did you pick it?

    - Next.js 14 (App Router) — full-stack in one repo, API routes and frontend together, Vercel deploy in one push. Saved at least 30 minutes vs a separate backend.
    - Raw JSON dataset — right-sized for 25 cars, zero DB setup time, fast to iterate on during the build
    - Groq (Llama 4) — fastest free inference available, 500K daily tokens, low latency makes the chat feel responsive
    - Tailwind — fast to build clean UI without fighting a component library
      
    Every choice was made to maximize what I could ship in 2-3 hours, not to impress anyone with the stack.

    
- What did you delegate to AI tools vs. do manually? Where did the tools help most?
    
    Delegated to AI:
    - Boilerplate scaffolding (Next.js setup, component structure)
    - Generating the 25-car dataset with realistic Indian market specs
    - First draft of UI components
    
    Done manually:
    - System prompt design and iteration — this is the product's brain, I wanted full control over how the model reasons about buyer needs
    - Model selection and switching (hit rate limits on 3 models before on earlier projects)
    - Token optimization — identified that injecting 50 full car objects was burning 6K tokens per request, designed the compression logic
    - All deployment configuration and debugging
    
    Where AI helped most: The coding scaffolding saved 45-60 minutes. Getting a working UI foundation in one prompt meant I could focus on the recommendation logic that actually matters.

    
- Where did they get in the way?
    

    The biggest friction was hitting API rate limits mid-build. When a model errored, the AI assistant would retry the same failing call repeatedly instead of recognizing the root cause.
    
    The AI was also overconfident about which Groq models were available and their exact limits — I had to verify against the actual Groq console rather than trust the suggestions.

    
- If you had another 4 hours, what would you add?
    
    1. Smarter pre-filtering — use embeddings or keyword extraction to send only the 5-6 most relevant cars to the model instead of slicing arbitrarily. Better recommendations, lower token cost.
    
    2. Multi-model fallback — if primary model hits rate limits, automatically fall back to the next available model. The architecture already supports this with a one-line model swap.
    
    3. Mobile-responsive UI — the buying journey happens on phones in India, this should have been prioritized.
    
    4. Shortlist persistence — let buyers save and share their shortlist via a URL. No auth needed, just a shareable link with query params.
