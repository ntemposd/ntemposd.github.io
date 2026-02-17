---
title: "Inside my product operating system"
date: "2026-02-17"
excerpt: "Every now and then I am trying to think product on a blank canvas, the almost ideal setup. I genuinely enjoy these exercises. Writing down my approach without real-world constraints forces me to rethink and maybe restructure how I operate as a Product Manager. This is what I did for a recent case study. It’s not advice, just a snapshot of how I think. Take whatever is useful."
tags: ["Product Management"]
draft: false
notionId: "30573424-8c3c-8057-85c4-dfb4eabdcd24"
image: "/posts/my-product-os.png"
---


## The Case Background


Recently, I worked with a travel tech company. The platform allows property owners to list their properties and distribute them to short-term rental marketplaces. The work, in simple terms, revolved around three questions. Nothing exotic; just everyday product work. What makes it interesting is not the domain, it’s that I’ve seen this patterns in very different environments. Approvals without clarity. Assumptions, small or bigger, without data to back them up. Solutions discussed before constraints are fully understood. Different industries, same structural questions.



**The questions in brief:**

- **A feature is approved**. What’s next?
- **Our funnel is declining**. What can we do?
- **Releases are delayed**. What’s your proposal?

## When a Feature is Approved


In this case, the executive team approved a new feature: **dynamic pricing based on seasonality and local events**. The intention was clear: **help hosts remain competitive and increase their revenue**. However, approval does not automatically translate into clarity. Before writing a single line of code I prefer to revisit the problem once again, so that I understand its shape better. How often does this actually happen? Who is really affected? Is the friction constant or occasional? What are hosts already doing today? I usually start with a small reseach cycle, analytics review and conversations with users; nothing heavy, just enough to see whether the pain exists the way we describe it, and whether it’s frequent or expensive enough to justify intervention.

**Research should answer questions like:**

- How often do hosts manually change prices?
- Do price changes correlate with higher bookings or revenue?
- What tools they already using?
- Is this about control problem or a confidence problem?
- What do power users look at differently compared to casual hosts?

The answers tend to narrow the problem. Not everyone needed “dynamic pricing.” Some hosts were already adjusting prices manually. Others weren’t touching them at all. So the question slowly shifted from “build dynamic pricing” to “what exactly are we helping with?”


### Bias Toward Lightweight Solutions


I rarely jump into defining the full solution, that’s prone to failure by definition and not my area anyways. Solutions are shaped with engineering. My role is to make sure we’re solving the right problem and keeping it lean without adding complexity too early. Lean doesn’t mean simplistic. It means reversible. It means something we can learn from. If we were to build something at this stage, it would probably look like a thin decision-support layer:



<div class="notion-columns">

<div class="notion-column">

**✅ What to build**

- Simple pricing optimization model + guardrails
- Basic manual event calendar
- Recommended price
- Short rationale
- Accept and Ignore buttons

![](/posts/my-product-os-img1.png)

</div>




<div class="notion-column">

❌ **What NOT to build (YET)**

- Well trained AI pricing optimization models
- Event scraping engines
- Complex rule builders
- Automatic price push logic
- Heavy marketplace integrations

![](/posts/my-product-os-img2.png)

</div>

</div>




Why do I cut the builder? Not because it’s fundamentally wrong as an idea. But because we don’t yet know enough to justify the decision. At this stage, we’re observing behavior. If we introduce too much sophistication too early, it becomes difficult to tell whether the feature is working or whether we’re just adding movement.



**What we don’t know yet**

- We don’t know if hosts override recommendations.
- We don’t know if confidence is the real bottleneck.
- We don’t know if the issue is actually visibility, rather than pricing.

### Success is defined upfront


Shipping something is progress. It’s not necessarily success. Before building, I prefer to define what “better” would mean in concrete terms. In our case I should track the following performance indicators. This is not a performance theater exercise, just as a way to reduce ambiguity later.



**Key Performance Indicators**

- Feature Adoption [% of hosts who interacted]
- Recommendation Acceptance Rate [% Accepted vs Ignored]
- Conversion Rate [Listing View → Booking Confirmation]
- Revenue Uplift % + Empty days count [Control vs Target group]
- Pricing support tickets

### Rollout is part of the feature


Once goals and metrics are aligned, the development team translates the idea into technical requirements. Which APIs, what contracts, what edge cases matter now? What stays out of scope? We break the work into small, possibly shipable increments, pieces that could go live independently, and we add them into the roadmap even if we choose not to expose them immediately



**An ideal rollout plan**

- Staging with internal users
- A handful of pilot hosts
- Feature flags (5% → 25% → 50% → 100%)
- KPI monitoring

## When the Booking Funnel Drops


The second scenario was about declining bookings and user complaints that the flow feels cumbersome.


When I hear “cumbersome,” I don’t redesign immediately.


I look for where friction actually lives.


I start with the funnel:


Listing → Checkout → Payment → Confirmation.


Then I break it down:

- Drop-off by step
- Device breakdown
- Time to complete
- Payment error rate
- Core Web Vitals
- Replays or heatmaps if available

If volume exists, data usually points somewhere very specific.


If volume is limited, I lean more into qualitative signals.


---


### I Talk to Users


5–10 interviews are usually enough.


Recent bookers.


Recent abandoners.


Support tickets are often brutally honest.


Sometimes a simple post-abandonment email asking


“What stopped you today?”


reveals more than a full redesign workshop.


---


### I Benchmark Without Romanticizing Competitors


When I look at competitors, I try to be structured:

- How many steps?
- When do fees appear?
- Is guest checkout allowed?
- What payment methods exist?
- Can I retry payment without losing data?
- What trust signals appear at key moments?

I take screenshots.


Short recordings.


Not to copy them — but to remove blind spots in our own flow.


Most booking funnels don’t need innovation.


They need friction removed.


---


## When Delivery Slips


The third scenario was about Agile delays.


When deadlines slip repeatedly, my default assumption is:


The system needs tuning.


Not the people.


So I try to make delays visible.


---


### I Start With Baselines


Before changing process, I want to see:

- Lead time
- Cycle time
- Predictability (% delivered vs committed)
- Blocked time
- Reopened tickets
- Context switching

Without a baseline, improvement conversations become subjective.


---


### I Narrow Focus


I don’t try to fix everything.


I usually align with the team on 2–3 measurable goals.


For example:

- Reduce cycle time
- Improve predictability
- Reduce rework

Then we experiment.


One improvement at a time.


Measure impact.


Keep or adjust.


---


### My Bias Toward Clarity and Focus Protection


A few patterns I’ve seen repeatedly:

- Unclear tickets slow everything down
- Too much parallel work kills flow
- Mid-sprint scope changes destroy predictability

So I tend to push for:

- A clear Definition of Ready
- Weekly refinement with engineering and design
- WIP limits
- Capacity-aware planning
- A Definition of Done that includes tests, analytics, and release notes

Small releases.


Progressive rollout.


I prefer boring consistency over heroic sprints.


---


## Stakeholder Alignment Is a System


One thing that has worked well for me is a lightweight product newsletter.


Every two weeks:

- Now / Next / Later
- Key risks
- Decisions taken
- Initiative status (Green / Orange / Red)
- Links to PRDs and decision logs

Nothing flashy.


Just clarity.


When stakeholders know where things stand, noise decreases.


And when noise decreases, delivery improves.


---


## What All Three Scenarios Have in Common


Whether it’s dynamic pricing, a broken funnel, or delivery delays, my approach doesn’t change much.


I try to:

- Validate before building
- Define success before coding
- Ship in increments
- Make work visible
- Improve systems, not blame people
- Protect focus
- Communicate clearly

It’s not revolutionary.


It’s just consistent.


And over time, consistency compounds.


This is more or less my default operating mode as a Product Manager.


If it resonates, feel free to borrow parts of it.


It’s simply what has worked for me.


