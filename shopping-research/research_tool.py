#!/usr/bin/env python3
"""Shopping Research Tool — AI-powered product research for smarter buying decisions."""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import anthropic
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt
from rich.rule import Rule

from prompts import QUESTION_GEN_SYSTEM, RESEARCH_SYSTEM

console = Console()
MODEL = "claude-opus-4-7"


def generate_questions(client: anthropic.Anthropic, product: str, use_case: str) -> list[str]:
    """Generate product-specific questions using Claude with cached system prompt."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": QUESTION_GEN_SYSTEM,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"Product I'm researching: {product}\nMy intended use: {use_case}\n\nGenerate targeted questions.",
            }
        ],
    )

    raw = response.content[0].text.strip()
    # Strip markdown code fences if Claude wrapped the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def run_research(
    client: anthropic.Anthropic,
    product: str,
    use_case: str,
    qa_pairs: list[tuple[str, str]],
) -> str:
    """Research products using web_search with the correct server-side tool loop."""
    qa_text = "\n".join(f"Q: {q}\nA: {a}" for q, a in qa_pairs)

    user_context = f"""Research the best {product} options for this user.

PRODUCT: {product}
USE CASE: {use_case}

USER REQUIREMENTS (from Q&A):
{qa_text}

Please search for current top-rated products, prices, and reviews that match these specific requirements. Generate a comprehensive buying guide."""

    messages = [{"role": "user", "content": user_context}]

    # Server-side tool loop: web_search runs on Anthropic's servers.
    # We loop until end_turn. On pause_turn (10-iteration server limit),
    # we re-send with the assistant response appended — no new user message.
    max_continuations = 5
    for _ in range(max_continuations):
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=[
                {
                    "type": "text",
                    "text": RESEARCH_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=[{"type": "web_search_20260209", "name": "web_search"}],
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            break

        if response.stop_reason == "pause_turn":
            # Server hit its internal tool-loop limit — append and continue.
            # Don't add a new user message; the API detects the trailing
            # server_tool_use block and resumes automatically.
            messages.append({"role": "assistant", "content": response.content})
            continue

        # Shouldn't happen for server-side tools, but be safe.
        break

    # Extract all text blocks from the final response
    text_parts = [block.text for block in response.content if hasattr(block, "text")]
    return "\n\n".join(text_parts)


def save_report(product: str, report: str) -> Path:
    """Save the report to a markdown file."""
    reports_dir = Path(__file__).parent / "reports"
    reports_dir.mkdir(exist_ok=True)

    safe_name = "".join(c if c.isalnum() or c in " -_" else "" for c in product)
    safe_name = safe_name.strip().replace(" ", "-").lower()
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filepath = reports_dir / f"{safe_name}-{timestamp}.md"

    filepath.write_text(f"# Shopping Research: {product}\n\n{report}\n")
    return filepath


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        console.print("[red]Error: ANTHROPIC_API_KEY environment variable not set.[/red]")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # ── Header ──────────────────────────────────────────────────────────────
    console.print()
    console.print(
        Panel.fit(
            "[bold blue]Omni-Shopper[/bold blue]  [dim]AI-powered product research[/dim]",
            border_style="blue",
            padding=(0, 2),
        )
    )
    console.print()

    # ── Step 1: Product + Use Case ───────────────────────────────────────────
    product = Prompt.ask("[bold]What product are you researching?[/bold]")
    use_case = Prompt.ask("[bold]What will you use it for?[/bold] [dim](be specific)[/dim]")
    console.print()

    # ── Step 2: Generate Questions ───────────────────────────────────────────
    with Progress(
        SpinnerColumn(),
        TextColumn("[dim]Generating personalized questions...[/dim]"),
        console=console,
        transient=True,
    ) as progress:
        progress.add_task("", total=None)
        try:
            questions = generate_questions(client, product, use_case)
        except Exception as e:
            console.print(f"[red]Failed to generate questions: {e}[/red]")
            sys.exit(1)

    console.print(
        f"[bold green]✓[/bold green] Got [bold]{len(questions)}[/bold] questions tailored to your search.\n"
    )

    # ── Step 3: Interactive Q&A ──────────────────────────────────────────────
    console.print(Rule("[dim]Answer each question — press Enter to skip[/dim]"))
    console.print()

    qa_pairs: list[tuple[str, str]] = []
    for i, question in enumerate(questions, 1):
        answer = Prompt.ask(f"[cyan]{i}.[/cyan] {question}")
        if answer.strip():
            qa_pairs.append((question, answer.strip()))
        console.print()

    if not qa_pairs:
        console.print("[yellow]No answers provided — proceeding with general research.[/yellow]\n")

    # ── Step 4: Research ─────────────────────────────────────────────────────
    console.print(Rule())
    console.print()
    with Progress(
        SpinnerColumn(),
        TextColumn(
            f"[bold yellow]Researching {product}...[/bold yellow] [dim](searching the web, may take 30–60s)[/dim]"
        ),
        console=console,
        transient=True,
    ) as progress:
        progress.add_task("", total=None)
        try:
            report = run_research(client, product, use_case, qa_pairs)
        except Exception as e:
            console.print(f"[red]Research failed: {e}[/red]")
            sys.exit(1)

    # ── Step 5: Display Report ───────────────────────────────────────────────
    console.print()
    console.print(
        Panel(
            Markdown(report),
            title=f"[bold green]Research Report: {product}[/bold green]",
            border_style="green",
            padding=(1, 2),
        )
    )

    # ── Step 6: Save Report ──────────────────────────────────────────────────
    try:
        filepath = save_report(product, report)
        console.print(f"\n[dim]Report saved → {filepath}[/dim]")
    except Exception:
        pass  # Saving is best-effort


if __name__ == "__main__":
    main()
