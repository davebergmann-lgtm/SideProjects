# Omni-Shopper

AI-powered shopping research CLI. Give it any product — golf clubs, laptops, sofas, running shoes — and it asks the right questions, then searches the web to build a tailored buying guide.

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
```

## Usage

```bash
python research_tool.py
```

The tool runs in three phases:

1. **Intake** — you name the product and your use case
2. **Q&A** — Claude generates 6–10 product-specific questions (budget, specs, skill level, etc.) and you answer them
3. **Research** — Claude searches the web and returns a full buying guide with ranked recommendations, value analysis, and red flags

Reports are saved to `reports/` as markdown files.

## How It Works

- **Question generation**: a cached system prompt + Claude Opus 4.7 classifies the product and generates domain-specific questions (shaft flex for golf clubs, RAM/processor for laptops, etc.)
- **Research**: uses the `web_search_20260209` built-in tool — Claude searches, reads reviews, and synthesizes recommendations in a server-side loop
- **Prompt caching**: both system prompts use `cache_control: ephemeral` to cut costs on repeated runs in the same session
