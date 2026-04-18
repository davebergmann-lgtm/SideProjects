#!/usr/bin/env python3
"""Omni-Shopper — AI-powered product research CLI."""

import argparse
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


# ── Claude calls ─────────────────────────────────────────────────────────────

def generate_questions(client: anthropic.Anthropic, product: str, use_case: str) -> list[str]:
    """Ask Claude to generate product-specific research questions (cached system prompt)."""
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
                "content": (
                    f"Product I'm researching: {product}\n"
                    f"My intended use: {use_case}\n\n"
                    "Generate targeted questions."
                ),
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
    """Research products via web_search (server-side tool, correct pause_turn loop)."""
    qa_section = (
        "\n".join(f"Q: {q}\nA: {a}" for q, a in qa_pairs)
        if qa_pairs
        else "(No additional requirements specified.)"
    )

    messages = [
        {
            "role": "user",
            "content": (
                f"Research the best {product} options for this user.\n\n"
                f"PRODUCT: {product}\n"
                f"USE CASE: {use_case}\n\n"
                f"USER REQUIREMENTS (from Q&A):\n{qa_section}\n\n"
                "Search for current top-rated products, prices, and expert reviews that match "
                "these specific requirements. Generate a comprehensive buying guide."
            ),
        }
    ]

    # web_search_20260209 is a server-side tool — Anthropic runs the searches.
    # Loop: end_turn → done. pause_turn → server hit its 10-iteration limit;
    # append assistant content and resend WITHOUT a new user message so the
    # API detects the trailing server_tool_use block and resumes automatically.
    for _ in range(5):
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
            messages.append({"role": "assistant", "content": response.content})
            continue

        break  # unexpected stop reason

    return "\n\n".join(
        block.text for block in response.content if hasattr(block, "text")
    )


# ── Helpers ──────────────────────────────────────────────────────────────────

def save_report(product: str, report: str) -> Path:
    reports_dir = Path(__file__).parent / "reports"
    reports_dir.mkdir(exist_ok=True)
    safe = "".join(c if c.isalnum() or c in " -_" else "" for c in product)
    safe = safe.strip().replace(" ", "-").lower()
    path = reports_dir / f"{safe}-{datetime.now().strftime('%Y%m%d-%H%M')}.md"
    path.write_text(f"# Shopping Research: {product}\n\n{report}\n")
    return path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="omni-shopper",
        description="AI-powered product research — ask the right questions, then search the web.",
    )
    p.add_argument("-p", "--product", help="Product to research (skips first prompt)")
    p.add_argument("-u", "--use-case", dest="use_case", help="Intended use (skips second prompt)")
    p.add_argument(
        "--no-questions",
        action="store_true",
        help="Skip the Q&A phase and go straight to research",
    )
    p.add_argument(
        "--no-save",
        action="store_true",
        help="Don't save the report to disk",
    )
    return p.parse_args()


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    args = parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        console.print("[red]Error: ANTHROPIC_API_KEY is not set.[/red]")
        console.print("[dim]  export ANTHROPIC_API_KEY=sk-ant-...[/dim]")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # ── Header ───────────────────────────────────────────────────────────────
    console.print()
    console.print(
        Panel.fit(
            "[bold blue]Omni-Shopper[/bold blue]  [dim]AI-powered product research[/dim]",
            border_style="blue",
            padding=(0, 2),
        )
    )
    console.print()

    # ── Step 1: Product + use case ────────────────────────────────────────────
    product = args.product or Prompt.ask("[bold]What product are you researching?[/bold]")
    use_case = args.use_case or Prompt.ask(
        "[bold]What will you use it for?[/bold] [dim](be specific)[/dim]"
    )
    console.print()

    # ── Step 2: Generate questions ────────────────────────────────────────────
    qa_pairs: list[tuple[str, str]] = []

    if not args.no_questions:
        with Progress(
            SpinnerColumn(),
            TextColumn("[dim]Generating personalized questions...[/dim]"),
            console=console,
            transient=True,
        ) as prog:
            prog.add_task("", total=None)
            try:
                questions = generate_questions(client, product, use_case)
            except Exception as e:
                console.print(f"[red]Failed to generate questions: {e}[/red]")
                sys.exit(1)

        console.print(
            f"[bold green]✓[/bold green] {len(questions)} questions tailored to your search.\n"
        )

        # ── Step 3: Interactive Q&A ───────────────────────────────────────────
        console.print(Rule("[dim]Answer each question — press Enter to skip[/dim]"))
        console.print()

        for i, question in enumerate(questions, 1):
            answer = Prompt.ask(f"[cyan]{i}.[/cyan] {question}")
            if answer.strip():
                qa_pairs.append((question, answer.strip()))
            console.print()

        if not qa_pairs:
            console.print(
                "[yellow]No answers provided — proceeding with general research.[/yellow]\n"
            )

    # ── Step 4: Research ──────────────────────────────────────────────────────
    console.print(Rule())
    console.print()
    with Progress(
        SpinnerColumn(),
        TextColumn(
            f"[bold yellow]Researching {product}...[/bold yellow]"
            " [dim](searching the web, 30–60 s)[/dim]"
        ),
        console=console,
        transient=True,
    ) as prog:
        prog.add_task("", total=None)
        try:
            report = run_research(client, product, use_case, qa_pairs)
        except Exception as e:
            console.print(f"[red]Research failed: {e}[/red]")
            sys.exit(1)

    # ── Step 5: Display ───────────────────────────────────────────────────────
    console.print()
    console.print(
        Panel(
            Markdown(report),
            title=f"[bold green]Research Report: {product}[/bold green]",
            border_style="green",
            padding=(1, 2),
        )
    )

    # ── Step 6: Save ──────────────────────────────────────────────────────────
    if not args.no_save:
        try:
            path = save_report(product, report)
            console.print(f"\n[dim]Saved → {path}[/dim]")
        except Exception:
            pass


if __name__ == "__main__":
    main()
