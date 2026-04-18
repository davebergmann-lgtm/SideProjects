"""Omni-Shopper — Streamlit web interface."""

import json
import os

import anthropic
import streamlit as st

from prompts import QUESTION_GEN_SYSTEM, RESEARCH_SYSTEM

MODEL = "claude-opus-4-7"

# ── Page config ───────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="Omni-Shopper",
    page_icon="🛍️",
    layout="centered",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
  /* ── Font: lock everything to one stack ── */
  html, body, [class*="css"], .stMarkdown, .stMarkdown p,
  .stMarkdown h1, .stMarkdown h2, .stMarkdown h3,
  .stMarkdown h4, .stMarkdown li, .stMarkdown a,
  .stTextInput input, .stTextArea textarea,
  .stButton > button, .stDownloadButton > button,
  .stAlert, .stSuccess {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                 Roboto, Helvetica, Arial, sans-serif !important;
    font-variant-ligatures: none;
  }

  /* ── Layout ── */
  .block-container {
    max-width: 720px;
    padding-top: 1.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* ── Report typography: consistent spacing ── */
  .stMarkdown h2 { margin-top: 1.6rem; margin-bottom: 0.4rem; font-size: 1.2rem; }
  .stMarkdown h3 { margin-top: 1.2rem; margin-bottom: 0.3rem; font-size: 1rem; }
  .stMarkdown p  { margin-bottom: 0.6rem; line-height: 1.6; }
  .stMarkdown li { margin-bottom: 0.3rem; line-height: 1.6; }
  .stMarkdown ul, .stMarkdown ol { margin-bottom: 0.8rem; }
  /* Prevent bold text from inheriting a different font */
  .stMarkdown strong, .stMarkdown b { font-family: inherit !important; }
  /* Remove code-block font from inline code in the report */
  .stMarkdown code {
    font-family: inherit !important;
    background: #f0f2f6;
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  /* ── Buttons: full-width, comfortable tap target ── */
  .stButton > button, .stDownloadButton > button {
    width: 100%;
    min-height: 2.75rem;
    font-size: 0.95rem;
  }

  /* ── Forms ── */
  div[data-testid="stForm"] { border: none; padding: 0; }

  /* ── Mobile: tighter padding on small screens ── */
  @media (max-width: 480px) {
    .block-container { padding-left: 0.5rem; padding-right: 0.5rem; }
    .stMarkdown h2 { font-size: 1.05rem; }
    .stTextInput input, .stTextArea textarea { font-size: 1rem; }
  }
</style>
""", unsafe_allow_html=True)

# ── Session state ─────────────────────────────────────────────────────────────

DEFAULTS = {
    "phase": "intake",       # intake | questions | qa | researching | report
    "product": "",
    "use_case": "",
    "questions": [],
    "qa_pairs": [],
    "report": "",
}
for k, v in DEFAULTS.items():
    if k not in st.session_state:
        st.session_state[k] = v


def reset():
    for k, v in DEFAULTS.items():
        st.session_state[k] = v


# ── Claude helpers ────────────────────────────────────────────────────────────

def get_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        st.error("**ANTHROPIC_API_KEY** is not set. Run:\n```\nexport ANTHROPIC_API_KEY=sk-ant-...\n```")
        st.stop()
    return anthropic.Anthropic(api_key=api_key)


def generate_questions(product: str, use_case: str) -> list[str]:
    client = get_client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=[{"type": "text", "text": QUESTION_GEN_SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{
            "role": "user",
            "content": (
                f"Product I'm researching: {product}\n"
                f"My intended use: {use_case}\n\n"
                "Generate targeted questions."
            ),
        }],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def stream_research(product: str, use_case: str, qa_pairs: list[tuple[str, str]]):
    """Yield text chunks from the research phase, handling pause_turn continuation."""
    client = get_client()

    qa_section = (
        "\n".join(f"Q: {q}\nA: {a}" for q, a in qa_pairs)
        if qa_pairs
        else "(No additional requirements specified.)"
    )
    messages = [{
        "role": "user",
        "content": (
            f"Research the best {product} options for this user.\n\n"
            f"PRODUCT: {product}\n"
            f"USE CASE: {use_case}\n\n"
            f"USER REQUIREMENTS (from Q&A):\n{qa_section}\n\n"
            "Search for current top-rated products, prices, and expert reviews that match "
            "these specific requirements. Generate a comprehensive buying guide."
        ),
    }]

    system = [{"type": "text", "text": RESEARCH_SYSTEM, "cache_control": {"type": "ephemeral"}}]
    tools = [{"type": "web_search_20260209", "name": "web_search"}]

    for _ in range(5):
        full_content = []
        stop_reason = "end_turn"

        with client.messages.stream(
            model=MODEL,
            max_tokens=4096,
            system=system,
            tools=tools,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text
            final = stream.get_final_message()
            full_content = final.content
            stop_reason = final.stop_reason

        if stop_reason == "end_turn":
            break

        if stop_reason == "pause_turn":
            # Server hit its 10-iteration tool limit — append and continue.
            # No new user message; the API resumes from the trailing server_tool_use block.
            messages.append({"role": "assistant", "content": full_content})
            continue

        break


# ── UI phases ─────────────────────────────────────────────────────────────────

st.title("🛍️ Omni-Shopper")
st.caption("AI-powered product research — ask the right questions, then search the web.")
st.divider()

# ── Phase 1: Intake ───────────────────────────────────────────────────────────

if st.session_state.phase == "intake":
    with st.form("intake_form"):
        product = st.text_input(
            "What product are you researching?",
            placeholder="e.g. golf clubs, standing desk, noise-cancelling headphones…",
        )
        use_case = st.text_area(
            "What will you use it for?",
            placeholder="Be specific — e.g. weekend rounds at a public course, mid-handicap golfer",
            height=100,
        )
        submitted = st.form_submit_button("Start Research →", type="primary")

    if submitted:
        if not product.strip() or not use_case.strip():
            st.warning("Please fill in both fields.")
        else:
            st.session_state.product = product.strip()
            st.session_state.use_case = use_case.strip()
            st.session_state.phase = "questions"
            st.rerun()

# ── Phase 2: Generate questions ───────────────────────────────────────────────

elif st.session_state.phase == "questions":
    st.markdown(f"**Product:** {st.session_state.product}")
    st.markdown(f"**Use case:** {st.session_state.use_case}")
    st.divider()

    with st.spinner("Generating personalized questions…"):
        try:
            questions = generate_questions(
                st.session_state.product, st.session_state.use_case
            )
            st.session_state.questions = questions
            st.session_state.phase = "qa"
            st.rerun()
        except Exception as e:
            st.error(f"Failed to generate questions: {e}")
            if st.button("← Back"):
                reset()
                st.rerun()

# ── Phase 3: Q&A ──────────────────────────────────────────────────────────────

elif st.session_state.phase == "qa":
    st.markdown(f"**Product:** {st.session_state.product}  \n**Use case:** {st.session_state.use_case}")
    st.divider()
    st.markdown("Answer what you know — leave anything blank to skip.")

    # Build a lookup of previous answers so edits are pre-populated
    prev = dict(st.session_state.qa_pairs)

    with st.form("qa_form"):
        answers: dict[str, str] = {}
        for i, question in enumerate(st.session_state.questions, 1):
            answers[question] = st.text_input(
                f"{i}. {question}", value=prev.get(question, ""), key=f"q{i}"
            )

        col1, col2 = st.columns([1, 3])
        with col1:
            back = st.form_submit_button("← Back")
        with col2:
            submitted = st.form_submit_button("Get Recommendations →", type="primary")

    if back:
        reset()
        st.rerun()

    if submitted:
        st.session_state.qa_pairs = [
            (q, a.strip()) for q, a in answers.items() if a.strip()
        ]
        st.session_state.phase = "researching"
        st.rerun()

# ── Phase 4: Research (streaming) ────────────────────────────────────────────

elif st.session_state.phase == "researching":
    st.markdown(f"**Researching:** {st.session_state.product}")
    st.caption("Searching the web and compiling your buying guide…")
    st.divider()

    report_placeholder = st.empty()
    full_report = ""

    try:
        for chunk in stream_research(
            st.session_state.product,
            st.session_state.use_case,
            st.session_state.qa_pairs,
        ):
            full_report += chunk
            report_placeholder.markdown(full_report + "▌")

        report_placeholder.markdown(full_report)
        st.session_state.report = full_report
        st.session_state.phase = "report"
        st.rerun()

    except Exception as e:
        st.error(f"Research failed: {e}")
        if st.button("← Start over"):
            reset()
            st.rerun()

# ── Phase 5: Report ───────────────────────────────────────────────────────────

elif st.session_state.phase == "report":
    st.success(f"Research complete: **{st.session_state.product}**")

    col1, col2, col3 = st.columns([2, 2, 1])
    with col1:
        if st.button("🔄 New Search"):
            reset()
            st.rerun()
    with col2:
        if st.button("✏️ Edit Answers"):
            st.session_state.phase = "qa"
            st.rerun()
    with col3:
        st.download_button(
            "⬇ Download",
            data=f"# Shopping Research: {st.session_state.product}\n\n{st.session_state.report}",
            file_name=f"{st.session_state.product.lower().replace(' ', '-')}-research.md",
            mime="text/markdown",
        )

    st.divider()
    st.markdown(st.session_state.report)
