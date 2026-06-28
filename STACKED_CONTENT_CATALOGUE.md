# Stacked — Content Catalogue & Plan Library
> The full plan library for the Stacked app. Each plan = a swipeable goal that generates a 5-step structured plan with curated content + action items, mapped to the Supabase schema (`goals` → `goal_steps` → `step_content`).
>
> **On the links:** Where I've verified a real, current video/article it's marked ✅ VERIFIED with a URL. Everything else has a **content brief** (what to find) + an **exact search query** so you or Claude Code can source and verify real links via the YouTube Data API before inserting into the DB. Never ship unverified URLs — auto-fetch the top result for each query, check it's live, then store it.

---

## How to Read Each Plan

```
PLAN: <title>
  Stream / Category / Difficulty / Est. duration / Premium?
  Purpose      — why this goal exists
  Value        — the concrete payoff the user gets
  Retention    — what pulls them back day to day
  Uniqueness   — why this beats a generic version

  STEP n: <title>
    Why it matters — one motivating line (shown in the accordion)
    Action items   — the "doing" task(s) with checkboxes
    Content        — curated media (type · brief · search query · est. mins)
    Score impact   — which Stack Score dimensions this raises
```

---

## THREE STREAMS

The Discover feed splits into three streams so users can pick their lane:

1. **💰 Money Foundations** — core personal finance (debt, investing, saving, budgeting, credit)
2. **🚀 Income Builders** — hobbies & skills that *make* money (flipping, side hustles, content, freelancing)
3. **🎯 Wealthy Habits** — skills & routines the wealthy actually practise (negotiation, sales, reading, discipline, communication)

---

# STREAM 1 — 💰 MONEY FOUNDATIONS

---

## PLAN 1: Get Out of Debt
**Category:** debt · **Difficulty:** Beginner · **Duration:** ~3 weeks · **Free**

- **Purpose:** Give users trapped by debt a clear, non-shaming path out.
- **Value:** A personalised payoff plan and the first real sense of control over their money.
- **Retention:** Each step visibly shrinks a "debt thermometer"; users return to log progress.
- **Uniqueness:** Combines education with a live payoff tracker — most apps do one or the other.

**STEP 1 — Understand Your Total Debt Picture**
- *Why it matters:* You can't beat what you haven't measured — clarity kills anxiety.
- *Action items:* ☐ List every debt with balance + interest rate ☐ Add them up for your real total
- *Content:* article · "how to list and total all your debts" · search `how to make a debt inventory beginners` · ~6 min
- *Score impact:* clarity +3, discipline +1

**STEP 2 — Choose a Payoff Strategy (Snowball vs Avalanche)**
- *Why it matters:* The right method keeps you motivated and can save hundreds in interest.
- *Action items:* ☐ Order debts by balance (snowball) and by rate (avalanche) ☐ Pick your method
- *Content:* video · debt snowball vs avalanche explained · search `debt snowball vs avalanche explained` · ~8 min
- *Score impact:* clarity +2, money_mindset +2

**STEP 3 — Cut & Redirect Unnecessary Spending**
- *Why it matters:* Every euro freed up is a euro thrown at your debt.
- *Action items:* ☐ Cancel 1 unused subscription ☐ Set a weekly "fun money" cap
- *Content:* video · simple ways to cut monthly spending · search `easy ways to cut monthly expenses` · ~10 min
- *Score impact:* discipline +3

**STEP 4 — Negotiate Your Interest Rates**
- *Why it matters:* One phone call can lower your rate and speed everything up.
- *Action items:* ☐ Call one lender and ask for a lower rate ☐ Note the result
- *Content:* article · script for negotiating a lower interest rate · search `how to negotiate lower credit card interest rate script` · ~5 min
- *Score impact:* discipline +2, money_mindset +2

**STEP 5 — Build Your Debt-Free Timeline**
- *Why it matters:* A date on the calendar turns "someday" into a finish line.
- *Action items:* ☐ Use a payoff calculator to get your debt-free date ☐ Set a monthly payment target
- *Content:* tool · free debt payoff calculator · search `free debt payoff calculator` · ~5 min
- *Score impact:* clarity +2, focus +2

---

## PLAN 2: Start Investing (Index Funds)
**Category:** investing · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Demystify investing so beginners actually start instead of waiting.
- **Value:** A funded brokerage account and a first investment made — the hardest hurdle cleared.
- **Retention:** "Investment Readiness" score climbs with each step; progress feels tangible.
- **Uniqueness:** Ends in a *real action* (first trade placed), not just theory.

**STEP 1 — Understand What Index Funds Are**
- *Why it matters:* Index funds are the simplest proven way most people build wealth.
- *Action items:* ☐ Be able to explain an index fund in one sentence
- *Content:* video · index funds explained simply · ✅ VERIFIED `https://www.youtube.com/watch?v=QFh_8FI2y1o` (Index Funds Explained — The Simplest Way To Build Wealth) · ~12 min
- *Score impact:* clarity +3, investment_readiness +2

**STEP 2 — Why Investing Beats Saving Long-Term**
- *Why it matters:* Cash loses value to inflation; investing is how money grows.
- *Action items:* ☐ Use a compound-interest calculator on €100/month for 20 years
- *Content:* tool · compound interest calculator · search `compound interest calculator` · ~5 min
- *Score impact:* money_mindset +3

**STEP 3 — Open Your First Brokerage Account**
- *Why it matters:* You can't invest until you have somewhere to invest from.
- *Action items:* ☐ Compare 2 beginner brokers ☐ Open an account
- *Content:* article · how to choose a beginner brokerage (EU/UK/US) · search `how to choose a brokerage account for beginners` · ~8 min
- *Score impact:* investment_readiness +3, discipline +1

**STEP 4 — Choose Your First Fund**
- *Why it matters:* A single broad-market fund is enough to start — no stock-picking needed.
- *Action items:* ☐ Pick one broad index fund (e.g. an S&P 500 / world tracker)
- *Content:* video · how to pick your first index fund · ✅ VERIFIED `https://www.youtube.com/watch?v=06yM7IABbK0` (How to Invest in Index Funds for Beginners) · ~14 min
- *Score impact:* investment_readiness +3, clarity +1

**STEP 5 — Make Your First Investment & Automate It**
- *Why it matters:* Automating removes willpower from the equation — wealth on autopilot.
- *Action items:* ☐ Invest any amount, even €10 ☐ Set up a recurring monthly deposit
- *Content:* article · how to set up automatic investing · search `how to set up automatic investing beginners` · ~6 min
- *Score impact:* investment_readiness +2, discipline +3

---

## PLAN 3: Build an Emergency Fund
**Category:** saving · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Create the financial cushion that prevents debt spirals.
- **Value:** A dedicated, growing safety net and reduced money anxiety.
- **Retention:** A "months of safety" meter fills as they save.
- **Uniqueness:** Frames the fund as *peace of mind* not just numbers.

**STEP 1 — Why an Emergency Fund Comes First**
- *Why it matters:* It's the foundation that stops one bad month becoming years of debt.
- *Action items:* ☐ Decide your starter target (e.g. €500)
- *Content:* article · why you need an emergency fund · search `why emergency fund important how much` · ~5 min
- *Score impact:* clarity +2, money_mindset +2

**STEP 2 — Calculate Your Safety Number**
- *Why it matters:* 3–6 months of essentials is the gold standard — know yours.
- *Action items:* ☐ Total your monthly essentials ☐ Multiply by 3 and by 6
- *Content:* tool · monthly expenses worksheet · search `monthly essential expenses calculator` · ~6 min
- *Score impact:* clarity +3

**STEP 3 — Open a Separate High-Yield Savings Account**
- *Why it matters:* Out of sight, out of mind — and earning interest while it waits.
- *Action items:* ☐ Open a separate savings account ☐ Name it "Emergency"
- *Content:* article · best high-yield savings accounts explained · search `high yield savings account explained beginners` · ~6 min
- *Score impact:* discipline +2, investment_readiness +1

**STEP 4 — Automate Your Savings**
- *Why it matters:* Paying yourself first guarantees the fund actually grows.
- *Action items:* ☐ Set an automatic transfer on payday
- *Content:* video · how to automate your savings · search `how to automate savings pay yourself first` · ~7 min
- *Score impact:* discipline +3

**STEP 5 — Protect & Replenish the Fund**
- *Why it matters:* The fund only works if you rebuild it after using it.
- *Action items:* ☐ Write your "what counts as an emergency" rules
- *Content:* article · emergency fund rules and mistakes · search `emergency fund rules when to use it` · ~5 min
- *Score impact:* money_mindset +2, discipline +1

---

## PLAN 4: Master Budgeting
**Category:** budgeting · **Difficulty:** Beginner · **Duration:** ~1 week · **Free**

- **Purpose:** Replace money chaos with a simple, sustainable system.
- **Value:** A working budget they'll actually stick to.
- **Retention:** Weekly check-in nudges; a "budget streak."
- **Uniqueness:** Teaches *one* simple method well rather than overwhelming with options.

**STEP 1 — Know Where Your Money Actually Goes**
- *Why it matters:* Awareness alone changes spending behaviour.
- *Action items:* ☐ Review last month's transactions ☐ Tag your top 3 spend categories
- *Content:* article · how to track your spending · search `how to track your spending beginners` · ~6 min
- *Score impact:* clarity +3

**STEP 2 — Learn the 50/30/20 Rule**
- *Why it matters:* A dead-simple framework that fits almost any income.
- *Action items:* ☐ Split your income into 50/30/20 buckets
- *Content:* video · 50/30/20 budget explained · search `50 30 20 budget rule explained` · ~8 min
- *Score impact:* clarity +2, money_mindset +2

**STEP 3 — Build Your First Budget**
- *Why it matters:* A plan on paper beats good intentions in your head.
- *Action items:* ☐ Fill in a simple budget template
- *Content:* tool · free budget template/spreadsheet · search `free monthly budget template` · ~10 min
- *Score impact:* discipline +2, focus +2

**STEP 4 — Cut the Money Leaks**
- *Why it matters:* Small recurring leaks sink the budget over time.
- *Action items:* ☐ Find and cancel 2 unnecessary recurring charges
- *Content:* video · find hidden subscriptions draining money · search `find and cancel unused subscriptions` · ~7 min
- *Score impact:* discipline +3

**STEP 5 — Make It a Weekly Habit**
- *Why it matters:* Budgets work only if you revisit them.
- *Action items:* ☐ Schedule a 10-min weekly "money date"
- *Content:* article · weekly money review habit · search `weekly money review habit` · ~5 min
- *Score impact:* discipline +2, focus +1

---

## PLAN 5: Fix & Understand Your Credit Score
**Category:** credit · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Turn a mysterious number into something users can control.
- **Value:** A higher score = cheaper loans, better cards, more freedom.
- **Retention:** A score-tracker they want to watch climb.
- **Uniqueness:** Region-aware (credit systems differ EU/UK/US).

**STEP 1 — What a Credit Score Actually Is**
- *Why it matters:* Understanding the rules is the first step to winning the game.
- *Action items:* ☐ Find out which factors affect your score
- *Content:* video · credit scores explained · search `credit score explained beginners` · ~9 min
- *Score impact:* clarity +3

**STEP 2 — Check Your Current Score for Free**
- *Why it matters:* You need a baseline before you can improve.
- *Action items:* ☐ Pull your free credit report
- *Content:* article · how to check your credit score free · search `how to check credit score free` · ~5 min
- *Score impact:* clarity +2, discipline +1

**STEP 3 — Fix Errors & Quick Wins**
- *Why it matters:* Many scores are dragged down by fixable mistakes.
- *Action items:* ☐ Dispute any errors ☐ Lower your credit utilisation
- *Content:* article · how to raise your credit score fast · search `how to improve credit score fast` · ~8 min
- *Score impact:* discipline +2, money_mindset +1

**STEP 4 — Build Long-Term Credit Health**
- *Why it matters:* Score-building is a marathon of small consistent habits.
- *Action items:* ☐ Set up autopay so you never miss a payment
- *Content:* video · habits that build credit over time · search `habits to build good credit` · ~7 min
- *Score impact:* discipline +3

**STEP 5 — Use Good Credit to Your Advantage**
- *Why it matters:* A strong score is a tool — make it work for you.
- *Action items:* ☐ Identify one goal your improved score unlocks
- *Content:* article · how to use good credit wisely · search `how to use good credit score benefits` · ~5 min
- *Score impact:* money_mindset +2, investment_readiness +1

---

# STREAM 2 — 🚀 INCOME BUILDERS

---

## PLAN 6: Learn to Flip & Resell
**Category:** income · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Show users they can make real money this week with almost no capital.
- **Value:** A first item sold for profit — proof they can generate income.
- **Retention:** A "profit logged" tracker; each flip adds to a running total.
- **Uniqueness:** Action-first — they sell something from their own home in step 1.

**STEP 1 — Understand the Flipping Model**
- *Why it matters:* Buy low, sell high — the simplest business that exists.
- *Action items:* ☐ Pick one platform (eBay / Facebook Marketplace / Vinted)
- *Content:* video · reselling beginner blueprint to first $10k · ✅ VERIFIED `https://www.youtube.com/watch?v=YOL-X6d239U` (How to Make Money Reselling — 2026 Guide) · ~15 min
- *Score impact:* money_mindset +3, clarity +1

**STEP 2 — Sell Something You Already Own**
- *Why it matters:* The fastest way to learn is to make one real sale today.
- *Action items:* ☐ List 1 item from your home ☐ Take good photos
- *Content:* article · how to write a listing that sells · search `how to write listing that sells facebook marketplace` · ~6 min
- *Score impact:* discipline +2, focus +1

**STEP 3 — Learn What's Worth Flipping**
- *Why it matters:* Knowing high-margin categories is the whole edge.
- *Action items:* ☐ Make a list of 5 profitable categories to hunt
- *Content:* article · best items to flip for profit · search `best items to flip for profit beginners` · ~8 min
- *Score impact:* clarity +2, money_mindset +1

**STEP 4 — Source Your First Inventory**
- *Why it matters:* Cheap sourcing = bigger margins.
- *Action items:* ☐ Visit one thrift store / yard sale / clearance aisle ☐ Buy one item to flip
- *Content:* video · sourcing for resale beginners · search `where to source items to flip beginners` · ~12 min
- *Score impact:* discipline +2, focus +2

**STEP 5 — Price, List & Reinvest**
- *Why it matters:* Reinvesting profit is how a flip becomes a business.
- *Action items:* ☐ Price using sold-listings research ☐ Reinvest your first profit
- *Content:* article · how to price items to sell fast · search `how to price items to resell research` · ~6 min
- *Score impact:* money_mindset +2, discipline +1

---

## PLAN 7: Start a Profitable Side Hustle
**Category:** income · **Difficulty:** Intermediate · **Duration:** ~3 weeks · **Premium**

- **Purpose:** Help users build a repeatable income stream beyond their job.
- **Value:** A validated side-hustle idea and first euro earned.
- **Retention:** Milestone tracker (idea → first customer → first €100).
- **Uniqueness:** Forces validation before effort — avoids the "build something nobody wants" trap.

**STEP 1 — Find Your Unfair Advantage**
- *Why it matters:* The best hustle uses skills you already have.
- *Action items:* ☐ List 3 skills + 3 things people ask your help with
- *Content:* video · how to choose a side hustle that fits you · search `how to choose the right side hustle` · ~10 min
- *Score impact:* clarity +3, money_mindset +1

**STEP 2 — Validate Before You Build**
- *Why it matters:* Proof of demand beats a polished idea nobody wants.
- *Action items:* ☐ Ask 5 potential customers if they'd pay
- *Content:* article · how to validate a business idea cheaply · search `how to validate side hustle idea` · ~7 min
- *Score impact:* clarity +2, focus +2

**STEP 3 — Set Up the Minimum to Start**
- *Why it matters:* You need almost nothing to make your first sale.
- *Action items:* ☐ Create a simple offer + a way to get paid
- *Content:* article · minimum viable side hustle setup · search `minimum setup to start side hustle` · ~6 min
- *Score impact:* discipline +2, focus +1

**STEP 4 — Get Your First Customer**
- *Why it matters:* The first sale changes your identity from dreamer to doer.
- *Action items:* ☐ Make your offer to 10 people
- *Content:* video · how to get your first customer · search `how to get your first customer side hustle` · ~9 min
- *Score impact:* money_mindset +3, discipline +1

**STEP 5 — Systemise & Scale**
- *Why it matters:* Repeatable systems turn a hustle into real income.
- *Action items:* ☐ Write down your repeatable delivery process
- *Content:* article · how to scale a side hustle · search `how to scale a side hustle systems` · ~7 min
- *Score impact:* focus +2, money_mindset +2

---

## PLAN 8: Make Money with Print-on-Demand
**Category:** income · **Difficulty:** Intermediate · **Duration:** ~3 weeks · **Premium**

- **Purpose:** A creative, low-risk online income path requiring no inventory.
- **Value:** A live store with products ready to sell.
- **Retention:** Track designs uploaded → first sale.
- **Uniqueness:** Pairs creativity with commerce — appeals to non-finance types.

**STEP 1 — How Print-on-Demand Works**
- *Why it matters:* Zero inventory, zero upfront cost — the lowest-risk product business.
- *Action items:* ☐ Understand the POD supply chain
- *Content:* video · print on demand explained for beginners · search `print on demand explained beginners 2026` · ~11 min
- *Score impact:* clarity +3

**STEP 2 — Pick a Niche That Sells**
- *Why it matters:* A focused niche beats generic designs every time.
- *Action items:* ☐ Choose one passionate niche/community
- *Content:* article · how to find a profitable POD niche · search `how to find print on demand niche` · ~7 min
- *Score impact:* clarity +2, money_mindset +1

**STEP 3 — Create Your First Designs**
- *Why it matters:* You don't need to be an artist — tools do the heavy lifting.
- *Action items:* ☐ Make 3 simple designs with a free tool
- *Content:* video · easy POD design with free tools · search `print on demand design tutorial free tools` · ~12 min
- *Score impact:* focus +2, discipline +1

**STEP 4 — Set Up Your Store**
- *Why it matters:* A live store is where the income actually happens.
- *Action items:* ☐ Connect a POD provider to a storefront
- *Content:* article · how to set up a POD store · search `how to set up print on demand store step by step` · ~8 min
- *Score impact:* discipline +2, focus +1

**STEP 5 — Get Your First Sale**
- *Why it matters:* Marketing is the difference between a store and a business.
- *Action items:* ☐ Promote one product on one channel
- *Content:* video · how to market print on demand products · search `how to get first print on demand sale` · ~10 min
- *Score impact:* money_mindset +3

---

## PLAN 9: Monetise Photography
**Category:** income · **Difficulty:** Intermediate · **Duration:** ~3 weeks · **Premium**

- **Purpose:** Turn a popular hobby into income.
- **Value:** First paid shoot or first stock sale.
- **Retention:** Portfolio + earnings tracker.
- **Uniqueness:** Bridges a creative passion into cash flow.

**STEP 1 — The Many Ways Photography Pays**
- *Why it matters:* There are more income paths than just weddings.
- *Action items:* ☐ Pick one path (stock, events, real estate, portraits)
- *Content:* video · ways to make money with photography · search `ways to make money with photography 2026` · ~10 min
- *Score impact:* clarity +3

**STEP 2 — Build a Mini Portfolio**
- *Why it matters:* Clients buy proof, not promises.
- *Action items:* ☐ Shoot and edit 5 portfolio-worthy photos
- *Content:* article · how to build a photography portfolio · search `how to build photography portfolio beginner` · ~7 min
- *Score impact:* focus +2, discipline +2

**STEP 3 — Price Your Work**
- *Why it matters:* Underpricing kills creative businesses.
- *Action items:* ☐ Research local rates ☐ Set your first price
- *Content:* article · how to price photography services · search `how to price photography services beginners` · ~6 min
- *Score impact:* money_mindset +3

**STEP 4 — Find Your First Client / Platform**
- *Why it matters:* Income needs a buyer — go find one.
- *Action items:* ☐ Upload to a stock site OR pitch one local client
- *Content:* video · how to get first photography client · search `how to get first photography client` · ~9 min
- *Score impact:* discipline +2, money_mindset +1

**STEP 5 — Turn One Sale Into Repeat Income**
- *Why it matters:* Repeat clients are where real money lives.
- *Action items:* ☐ Ask one happy client for a referral
- *Content:* article · getting repeat photography clients · search `how to get repeat photography clients` · ~6 min
- *Score impact:* focus +2, money_mindset +1

---

## PLAN 10: Start a Newsletter / Writing Income
**Category:** income · **Difficulty:** Intermediate · **Duration:** ~3 weeks · **Premium**

- **Purpose:** Build an audience-based income that compounds.
- **Value:** A published newsletter with first subscribers.
- **Retention:** Subscriber-count tracker.
- **Uniqueness:** Teaches the compounding nature of audience — rare in finance apps.

**STEP 1 — Why Writing Is Leverage**
- *Why it matters:* Words written once can earn forever.
- *Action items:* ☐ Pick one topic you can write about weekly
- *Content:* video · why start a newsletter / writing online · search `why start a newsletter 2026` · ~10 min
- *Score impact:* clarity +2, money_mindset +2

**STEP 2 — Choose Your Niche & Platform**
- *Why it matters:* A clear niche attracts a loyal audience.
- *Action items:* ☐ Set up a free newsletter platform
- *Content:* article · how to start a newsletter from scratch · search `how to start a newsletter beginners` · ~8 min
- *Score impact:* clarity +2, focus +1

**STEP 3 — Write & Publish Your First Issue**
- *Why it matters:* Shipping beats perfecting — publish now.
- *Action items:* ☐ Write and send issue #1
- *Content:* article · how to write a great first newsletter · search `how to write your first newsletter` · ~6 min
- *Score impact:* discipline +3

**STEP 4 — Grow Your First 100 Subscribers**
- *Why it matters:* Distribution is the real skill.
- *Action items:* ☐ Share your newsletter in 3 relevant places
- *Content:* video · how to get first newsletter subscribers · search `how to grow newsletter first 100 subscribers` · ~11 min
- *Score impact:* focus +2, money_mindset +1

**STEP 5 — Turn Readers Into Revenue**
- *Why it matters:* An audience is an asset you can monetise many ways.
- *Action items:* ☐ Choose one monetisation method to plan for
- *Content:* article · ways to monetise a newsletter · search `how to monetize a newsletter` · ~7 min
- *Score impact:* money_mindset +3

---

# STREAM 3 — 🎯 WEALTHY HABITS

---

## PLAN 11: Master Negotiation
**Category:** skill · **Difficulty:** Intermediate · **Duration:** ~2 weeks · **Premium**

- **Purpose:** Teach the single highest-ROI money skill there is.
- **Value:** Real money saved/earned through one successful negotiation.
- **Retention:** "Money won through negotiation" tracker.
- **Uniqueness:** Directly ties a soft skill to hard euros.

**STEP 1 — Why Everything Is Negotiable**
- *Why it matters:* The wealthy negotiate; most people just accept the first number.
- *Action items:* ☐ List 3 things in your life you could negotiate
- *Content:* video · negotiation basics / never split the difference principles · search `negotiation skills basics tactics` · ~12 min
- *Score impact:* money_mindset +3, clarity +1

**STEP 2 — Master the Power of Silence & Anchoring**
- *Why it matters:* Two simple tactics swing most negotiations.
- *Action items:* ☐ Practise staying silent after stating a number
- *Content:* article · anchoring and silence in negotiation · search `anchoring tactic negotiation explained` · ~6 min
- *Score impact:* discipline +2, focus +2

**STEP 3 — Prepare Like a Pro**
- *Why it matters:* The prepared party almost always wins.
- *Action items:* ☐ Research your target number + walk-away point
- *Content:* article · how to prepare for a negotiation · search `how to prepare for a negotiation` · ~7 min
- *Score impact:* focus +2, clarity +1

**STEP 4 — Negotiate Something Real**
- *Why it matters:* Skill only sticks when you use it.
- *Action items:* ☐ Negotiate one real thing (bill, salary, purchase)
- *Content:* video · real negotiation examples / role-play · search `real life negotiation examples` · ~10 min
- *Score impact:* money_mindset +3, discipline +1

**STEP 5 — Negotiate Your Income**
- *Why it matters:* A salary bump compounds for the rest of your career.
- *Action items:* ☐ Draft your case for a raise or higher rate
- *Content:* article · how to negotiate a salary raise · search `how to negotiate salary raise script` · ~8 min
- *Score impact:* money_mindset +2, investment_readiness +1

---

## PLAN 12: Learn High-Income Sales
**Category:** skill · **Difficulty:** Advanced · **Duration:** ~3 weeks · **Premium**

- **Purpose:** Sales is the highest-leverage skill for income — teach it.
- **Value:** Confidence and a framework to sell anything ethically.
- **Retention:** Practice-rep tracker.
- **Uniqueness:** Positions sales as service, not sleaze — reframes a feared skill.

**STEP 1 — Sales Is Just Helping at Scale**
- *Why it matters:* Reframing sales as service removes the fear.
- *Action items:* ☐ Write your honest belief about what you'd sell
- *Content:* video · sales mindset for beginners · search `sales mindset beginners ethical selling` · ~11 min
- *Score impact:* money_mindset +3

**STEP 2 — Learn to Listen & Ask Questions**
- *Why it matters:* The best salespeople talk least and listen most.
- *Action items:* ☐ Practise asking 3 open questions in a real chat
- *Content:* article · discovery questions in sales · search `sales discovery questions to ask` · ~6 min
- *Score impact:* focus +2, clarity +2

**STEP 3 — Handle Objections Calmly**
- *Why it matters:* Objections are requests for more information, not rejection.
- *Action items:* ☐ Write responses to your 3 most common objections
- *Content:* video · how to handle objections · search `how to handle sales objections` · ~10 min
- *Score impact:* discipline +2, money_mindset +1

**STEP 4 — Ask for the Close**
- *Why it matters:* Most sales are lost by never asking.
- *Action items:* ☐ Practise one clear, confident closing line
- *Content:* article · simple closing techniques · search `simple sales closing techniques` · ~6 min
- *Score impact:* money_mindset +2, discipline +1

**STEP 5 — Apply It to Earn**
- *Why it matters:* The skill pays only when used in the real world.
- *Action items:* ☐ Use the framework in one real conversation
- *Content:* article · applying sales skills to make money · search `how to use sales skills to make money` · ~7 min
- *Score impact:* money_mindset +3

---

## PLAN 13: Read Like the Wealthy
**Category:** habit · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Build the keystone habit shared by most self-made wealthy people.
- **Value:** A sustainable reading habit and first finished money book.
- **Retention:** Pages/books-read streak.
- **Uniqueness:** Curated money-book roadmap rather than generic "read more."

**STEP 1 — Why the Wealthy Read So Much**
- *Why it matters:* Reading is the cheapest mentorship money can buy.
- *Action items:* ☐ Commit to a daily page count (even 10)
- *Content:* video · reading habits of successful people · search `reading habits of wealthy successful people` · ~9 min
- *Score impact:* money_mindset +3

**STEP 2 — Pick Your First Money Book**
- *Why it matters:* The right first book sets the trajectory.
- *Action items:* ☐ Choose one beginner money classic
- *Content:* article · best personal finance books for beginners · search `best personal finance books beginners` · ~6 min
- *Score impact:* clarity +2, money_mindset +1

**STEP 3 — Build a Daily Reading Trigger**
- *Why it matters:* Habits stick when attached to existing routines.
- *Action items:* ☐ Pair reading with an existing daily habit
- *Content:* article · how to build a reading habit · search `how to build a daily reading habit` · ~6 min
- *Score impact:* discipline +3

**STEP 4 — Take Notes That Stick**
- *Why it matters:* Applied knowledge beats passive reading.
- *Action items:* ☐ Write 3 takeaways from what you read
- *Content:* video · how to retain what you read · search `how to remember what you read note taking` · ~8 min
- *Score impact:* focus +2, clarity +1

**STEP 5 — Apply One Idea**
- *Why it matters:* A book is only worth what you do with it.
- *Action items:* ☐ Implement one idea from the book this week
- *Content:* article · turning reading into action · search `how to apply what you read books` · ~5 min
- *Score impact:* discipline +2, money_mindset +1

---

## PLAN 14: Build a Wealthy Morning Routine (Discipline)
**Category:** habit · **Difficulty:** Beginner · **Duration:** ~2 weeks · **Free**

- **Purpose:** Build the discipline foundation that every other goal depends on.
- **Value:** A consistent routine that raises focus and follow-through.
- **Retention:** Daily routine streak — the core habit loop.
- **Uniqueness:** Frames discipline as the multiplier on all financial goals.

**STEP 1 — Why Routines Build Wealth**
- *Why it matters:* Discipline in small things creates capacity for big things.
- *Action items:* ☐ Identify your current morning autopilot
- *Content:* video · morning routines of successful people · search `morning routine successful people` · ~9 min
- *Score impact:* discipline +2, money_mindset +1

**STEP 2 — Design a Simple 3-Step Routine**
- *Why it matters:* Simple routines survive; complex ones collapse.
- *Action items:* ☐ Pick 3 small morning actions
- *Content:* article · how to build a morning routine that sticks · search `how to build a morning routine that sticks` · ~6 min
- *Score impact:* focus +2, discipline +2

**STEP 3 — Beat the Snooze & Distraction**
- *Why it matters:* Winning the first hour wins the day.
- *Action items:* ☐ Put your phone across the room tonight
- *Content:* video · how to stop hitting snooze / phone first thing · search `how to stop checking phone first thing morning` · ~7 min
- *Score impact:* discipline +3

**STEP 4 — Track Your Streak**
- *Why it matters:* What gets tracked gets repeated.
- *Action items:* ☐ Mark your routine done for 5 days straight
- *Content:* article · habit streaks and consistency · search `how to keep a habit streak going` · ~5 min
- *Score impact:* discipline +2, focus +1

**STEP 5 — Stack a Money Habit On Top**
- *Why it matters:* Attach a money action to your routine and wealth compounds daily.
- *Action items:* ☐ Add a 2-min daily money check to your routine
- *Content:* article · habit stacking explained · search `habit stacking explained beginners` · ~6 min
- *Score impact:* discipline +2, clarity +1

---

## PLAN 15: Public Speaking & Communication
**Category:** skill · **Difficulty:** Intermediate · **Duration:** ~3 weeks · **Premium**

- **Purpose:** Communication is a wealth multiplier — teach it.
- **Value:** Visible confidence improvement and one delivered talk/pitch.
- **Retention:** Practice-rep tracker.
- **Uniqueness:** Links communication directly to career & income leverage.

**STEP 1 — Why Communication = Income**
- *Why it matters:* The best communicators get paid and promoted more.
- *Action items:* ☐ Identify one situation where speaking better would pay off
- *Content:* video · why communication skills matter for success · search `why communication skills important career` · ~9 min
- *Score impact:* money_mindset +2, clarity +1

**STEP 2 — Beat the Fear**
- *Why it matters:* Nerves are normal — technique beats them.
- *Action items:* ☐ Record yourself speaking for 1 minute
- *Content:* video · overcome fear of public speaking · search `how to overcome fear of public speaking` · ~10 min
- *Score impact:* discipline +2, focus +1

**STEP 3 — Structure a Clear Message**
- *Why it matters:* Clarity is persuasion.
- *Action items:* ☐ Outline a 2-minute talk with one core point
- *Content:* article · how to structure a talk · search `how to structure a speech clearly` · ~6 min
- *Score impact:* clarity +3

**STEP 4 — Practise Out Loud**
- *Why it matters:* Reps build fluency that reading never will.
- *Action items:* ☐ Deliver your talk out loud 3 times
- *Content:* video · public speaking practice techniques · search `public speaking practice techniques` · ~9 min
- *Score impact:* discipline +2, focus +2

**STEP 5 — Deliver It for Real**
- *Why it matters:* Real delivery is where confidence is forged.
- *Action items:* ☐ Present to one real person or group
- *Content:* article · tips for delivering your first talk · search `tips for first public speaking` · ~6 min
- *Score impact:* money_mindset +2, discipline +1

---

# IMPLEMENTATION NOTES

### Sourcing real content links
For every step marked with a `search` query:
1. Query the **YouTube Data API** (`search.list`, `type=video`, `videoEmbeddable=true`, `relevanceLanguage=en`, `order=relevance`) with the provided string.
2. Take the top result, confirm it's live and ≥ a few thousand views (quality proxy).
3. Store `title`, `url`, `thumbnail_url` (from the API), `est_minutes` (from `contentDetails.duration`).
4. For `article` and `tool` types, use a web search API and store the top reputable result (prefer .gov, established finance sites, well-known blogs).
5. **Re-validate links monthly** via a cron job — dead links auto-flag for re-sourcing.

### Premium gating
Free plans: 1, 2, 3, 4, 5, 6, 13, 14 (the core money foundations + flipping + 2 habit plans — enough value to hook).
Premium plans: 7, 8, 9, 10, 11, 12, 15 (the higher-effort income & skill plans).

### Score impact → Stack Score
Each completed step's `score_impact` JSON adds to the user's live Stack Score dimensions. Cap each dimension at 99. Surface the floating "+X Discipline" animation on step completion (per the architecture doc).

### Retention layer
- A plan's progress bar + the Stack Score bump per step = the core loop.
- Income Builder plans should additionally surface a **"profit logged"** field so users record real money earned — this is your strongest retention and testimonial engine.
- Wealthy Habits plans should surface a **streak** where relevant.

### Expansion roadmap
This is 15 flagship plans (75 steps). Natural next additions: Tax Basics, Negotiating Rent/Bills, Freelancing on Upwork, YouTube/Content income, Real Estate Basics, Crypto Safely, Frugal Living Mastery, Networking, Chess/Strategic Thinking, Learning a High-Value Language.

---

*Stacked Content Catalogue v1.0 — 15 plans, 75 steps, 3 streams.*
