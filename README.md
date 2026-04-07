<img width="80" height="80" alt="Icon" src="https://github.com/user-attachments/assets/9f43052e-cb33-4061-a1c6-8c718f79e684" />

Base Surfaces Beta
=======
Base Surfaces is a repo for Wise Design. It allows designers to clone pixel-perfect skeletons of the Wise Web and Mobile apps, with built-in logic to use Claude to prototype with. Included are key surfaces that designers work with on a daily basis, giving them access to explore more immersive experiences for Wise customers. **It's a 99% replica of Wise's top-level surfaces.**


Make Builds
-----------

Interactive prototypes you can open in Figma — no local setup needed.

| | Latest | Download |
|--|--------|----------|
| **Web** | V1.01 | [Web V1.01.make](base-surfaces-web/makes/Web%20V1.01.make) |
| **Mobile** | V1.02 | [Mobile V1.02.make](base-surfaces-mobile/makes/Mobile%20V1.02.make) |

**Figma project:** [Base Surfaces — Make Builds](https://www.figma.com/files/826948582432925732/project/579451617?fuid=1009076293124464990)

See version history: [Web makes](base-surfaces-web/makes/) · [Mobile makes](base-surfaces-mobile/makes/)


What's Included?
-----------
Screens have been built for both Consumer and Business profiles across Web and Mobile, to give you a jumping off point to prototype with. These include Launchpad, Accounts, Currencies, Card, Payments, Recipients, Insights, Account Details, Send, Add, Convert, Request.

Both prototypes share the same data — balances, transactions, recipients, and rates all live in one place and stay in sync.


What Logic is Built In?
-----------
The following logic is built, to give you an easier time in building your prototype:

* Each profile, consumer and business have their own sets of accounts, relevant transactions, currencies, cards amounts and recipients.
* Total balance, account balance and currency balance's are all synced and add up correctly, if new transactions are added, you'll see these figures update. This includes the Insights screen too. If you don't, just ask Claude to update them based on the new figures.
* The concept of having a currency in cash, stocks or interest is built in, with all the UI changes that occur.
* The Wise Platform rates API is built in, so the rates you see are up to date with what that provides.
* All types of account, including Current, Jars, Groups.
* Language support for English, Spanish, German and French. Need a different one? Just ask Claude. Translations slowing you down? Ask Claude to stop doing them.
* The concept of same currency and cross currency in the Send flow.


How This Repo Works
-----------

`transferwise/base-surfaces` is the source of truth. You clone it, push it to your own GitHub repo, then create branches for each prototype.

```
transferwise/base-surfaces          (source of truth)
        |
        v  clone + push to your own repo
your-name/my-base-surfaces         (your copy)
        |
        +-- branch-1                (prototype A)
        +-- branch-2                (prototype B)
        +-- branch-3                (prototype C)
```

**The golden rule: keep `main` clean.** Never commit directly to main on your copy. This makes it easy to pull in future updates from the source repo. Your prototype branches are untouched.

### Repo structure

```
base-surfaces/
├── base-surfaces-web/       Web prototype (React + Vite)
├── base-surfaces-mobile/    Mobile prototype (React + Vite, iOS DeviceFrame)
└── shared-resources/        Shared data & business rules
    ├── data/                Balances, transactions, recipients, rates, jars
    └── account-logic/       Account types, interest/stocks rules
```

Both prototypes pull data from `shared-resources/`. Edit data there — changes show up in both apps automatically.


Prerequisites
-----------

You'll need a few things installed before you start. If you're on a Mac and don't have these yet, here's how to get set up:

### 1. Homebrew (Mac package manager)

Install Homebrew from **Kandji Self Service** on your Mac. Didn't work? Contact **#ut-tech-support**.

### 2. Node.js and npm

```bash
brew install node
```

Verify it worked:

```bash
node --version
npm --version
```

### 3. Git

Git usually comes with macOS, but if not:

```bash
brew install git
```

### 4. Claude Code

Set up Claude Code following this [instruction guide](https://transferwise.atlassian.net/wiki/spaces/GenAIP/pages/3709765113/Install+Claude+Code)

### 5. Recommended MCP servers

These make Claude much more capable inside the project:

* **Figma MCP** — lets Claude read Figma designs directly. Very useful for pulling design references, brand images, and card assets.
* **GitHub MCP** — lets Claude push code, create branches, and manage your repos.
* **Wise Design System (Storybook) MCP** — lets Claude access Neptune component documentation, props, and usage examples directly. Install it by pasting this into Claude Code:

```
claude mcp add --transport http --client-id cdf3737dff9d485485968e50b63fd8b4 wise-design-system https://storybook.wise.design/mcp --scope project
```

Set these up inside Claude Code's MCP settings.


Getting Started
-----------

### 1. Clone this repo

Open your terminal and run:

```bash
git clone https://github.com/transferwise/base-surfaces.git
cd base-surfaces
```

### 2. Push to your own GitHub repo

Create a new repo under your own GitHub account (e.g. `your-name/my-base-surfaces`), then point your local clone at it:

```bash
git remote set-url origin https://github.com/your-name/my-base-surfaces.git
git push -u origin main
```

This gives you your own copy to work in. To pull future updates from the source repo, add it as an upstream remote:

```bash
git remote add upstream https://github.com/transferwise/base-surfaces.git
```

### 3. Run a prototype

Open Claude Code in your project directory and tell it which prototype you want to work on:

```
Install and run the web prototype
```

```
Install and run the mobile prototype
```

### 4. Start a new prototype

Always create a branch — never commit directly to `main`. Ask Claude:

```
Create a new branch called my-prototype-name and start working from there
```

Do all your work on this branch. Ask Claude to commit and push when you're ready.

### 5. Getting updates from base-surfaces

When new components or features are added to base-surfaces, you can pull them into your copy:

```bash
git checkout main
git pull upstream main
git push origin main
```

Then merge the updates into your prototype branch:

```bash
git checkout my-prototype-branch
git merge main
```

Or ask Claude:

```
Pull the latest updates from main and merge them into my current branch
```

### 6. Configure your prototype

Access prototype settings to switch accounts, change appearance, language, and copy useful prompts:

* **Web** — press **Ctrl + H**
* **Mobile** — click the **Settings** button next to the device frame

You'll find a project context prompt there — copy it and paste it into Claude to give it full context about the project scope.

### 7. Start prototyping

Ask Claude to make changes. For example:

```
Add a new EUR currency to the business account jar
```
```
Build a confirmation step in the send flow
```
```
Add a banner to the home page promoting a referral offer
```
```
Change the card page to show a frozen card state
```


### 8. Share your prototype (Figma Make)

You can convert your prototype into a Figma Make file that anyone can open and interact with — no local setup needed.

**First-time setup:** The converter is a private repo. DM Connor for access, then paste into Claude:

```
Clone the make-converter repo from https://github.com/transferwise/make-converter.git to ~/.claude/make-converter, install its dependencies, then copy the skill and skill-fix folders into ~/.claude/skills/make and ~/.claude/skills/make-fix
```

**Building a .make file:** In Claude Code, type:

```
/make
```

This packages your project into a `.make` file you can open at [figma.com/make](https://www.figma.com/make/). If something looks wrong in Make, use `/make-fix` with a screenshot or error.



Screenshots
-----------

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/c9cc8832-8e5a-4791-97c1-404e7706e5d0" width="400" /><br /><strong>Home</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/e89b4ca4-4a8b-44eb-8a00-bc8c34e9b1f4" width="400" /><br /><strong>Cards</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/6a937586-408b-4629-851a-5337b76ca58b" width="400" /><br /><strong>Transactions</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/537afdff-5542-4400-84f2-695b917150b4" width="400" /><br /><strong>Payments</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/791adc21-8312-4553-aecf-113f18107887" width="400" /><br /><strong>Insights</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/6f847ae7-71b9-4ae7-aed3-e0d7d4937c05" width="400" /><br /><strong>Account</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/4a33616e-a1ae-42a6-bc75-4eeac179969d" width="400" /><br /><strong>Current Account</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/8a935c06-b3ea-4051-a0ea-192df27b24fe" width="400" /><br /><strong>Currency Page</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/9b5895d9-28df-4682-8f64-2cd49bf09cf9" width="400" /><br /><strong>Account Details</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/fa8d6b27-0b62-4f58-8004-15d02d93bea3" width="400" /><br /><strong>Send — Recipient</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/d295612e-054b-4c20-9dc2-815327544b54" width="400" /><br /><strong>Send — Amount</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/e637ef45-1c78-428d-827b-3f613f217b2e" width="400" /><br /><strong>Convert</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/e3d7ec10-9aa6-4e1c-b0e9-18f78c8f11dc" width="400" /><br /><strong>Add Money</strong></td>
<td align="center"><img src="https://github.com/user-attachments/assets/19800e9b-8b7b-43a2-89fc-d09b01c98eeb" width="400" /><br /><strong>Request — Recipient</strong></td>
</tr></table>

<table><tr>
<td align="center"><img src="https://github.com/user-attachments/assets/5da9ac7e-3c3f-47eb-9eb2-aea84adea552" width="400" /><br /><strong>Request — Amount</strong></td>
<td width="400">&nbsp;</td>
</tr></table>
