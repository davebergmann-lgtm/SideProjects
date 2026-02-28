# Setup & Customization Guide

## 1. Connect Your Formspree Form (email collection)

1. Go to [formspree.io](https://formspree.io) and sign up for a free account.
2. Click **+ New Form**, give it a name (e.g. "Coming Soon Signups"), and copy the **Form ID** shown (looks like `xabc1234`).
3. Open `index.html` and find this line:

   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```

4. Replace `YOUR_FORM_ID` with your actual form ID:

   ```html
   action="https://formspree.io/f/xabc1234"
   ```

5. Save and push. All emails from your form will now appear in your Formspree dashboard.

---

## 2. Deploy on GitHub Pages (free hosting)

1. Push this folder to a GitHub repository named `side-business-ideas`
   (or any name — it doesn't matter for Pages).

2. Go to your repository on GitHub → **Settings** → **Pages**.

3. Under **Source**, set:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`

4. Click **Save**. GitHub Pages will give you a URL like:
   ```
   https://YOUR-USERNAME.github.io/side-business-ideas/
   ```
   It goes live in about 60 seconds.

---

## 3. Update the Page Text

All editable spots are marked with `✏️ EDIT:` comments in `index.html`.

| What to change | Where in index.html |
|---|---|
| Browser tab title | `<title>` tag (line ~5) |
| Logo / brand name | `.logo` div |
| Main headline | `<h1 class="headline">` |
| Subheadline | `<p class="subheadline">` |
| Feature cards (3×) | `.feature-card` divs |
| Footer name & email | `<footer>` section |

---

## 4. Change the Brand Color

Open `style.css` and change line 13:

```css
--accent: #6c63ff;  /* change this hex to your brand color */
```

---

## 5. Connect Your Own Domain

### Option A: Apex domain (yourdomain.com)

1. In your domain registrar's DNS settings, add **two A records**:

   | Type | Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

2. In GitHub → Settings → Pages → **Custom domain**, enter `yourdomain.com`.

3. Check **Enforce HTTPS** once it appears (takes ~24h for DNS to propagate).

### Option B: Subdomain (www.yourdomain.com or coming.yourdomain.com)

1. Add a **CNAME record** in your DNS:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | www | YOUR-USERNAME.github.io |

2. In GitHub → Settings → Pages → **Custom domain**, enter `www.yourdomain.com`.

3. A file called `CNAME` will be auto-created in your repo by GitHub — don't delete it.

### Notes
- DNS changes can take a few minutes to 48 hours to propagate.
- HTTPS is free via GitHub Pages (Let's Encrypt) — always enable it.

---

## 6. View Collected Emails

Log into [formspree.io/dashboard](https://formspree.io/dashboard) to see all signups.
You can export them as CSV or connect Formspree to Mailchimp, ConvertKit, etc. via Zapier.
