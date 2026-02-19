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
- What tools they already using to calculate the prices?
- Is this a control problem or a confidence problem?
- Do power users behave differently from casual hosts?

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


In this case, bookings were declining and users were describing the flow as “cumbersome”. That word alone can easily justify a redesign discussion. But before redesigning anything, I prefer to locate the friction. First we define the flow clearly: Listing View → Checkout → Payment → Confirmation. If something is off, it usually happens somewhere specific.


### I Look at the Signals


I start with the conversion rate by step, segmented by device, country, and acquisition source. Then I look deeper: time to complete, payment error rate, core web vitals. If available, session replays and heatmaps help connect numbers to behavior. If volume exists, the data tends to narrow the issue.
If it doesn’t, I rely more on qualitative input. Five to ten conversations with recent bookers and recent abandoners are usually enough. Support tickets often add context. Sometimes a simple post-abandonment “What stopped you today?” email provides more clarity than a redesign workshop.


### I Benchmark  Competitors


At the same time, I review competitor funnels. Not to replicate them, but to understand where we might be missing something. I capture screenshots, record short flows, and compare them across a few basic dimensions 


| Criteria (Score 1-5)   | Our App | Competitor A | Competitor B | Competitor C |
| ---------------------- | ------- | ------------ | ------------ | ------------ |
| **Steps & friction**   |         |              |              |              |
| **Price clarity**      |         |              |              |              |
| **Sense of trust**     |         |              |              |              |
| **Payment experience** |         |              |              |              |
| **UX & performance**   |         |              |              |              |


Explaining the table’s criteria, I look at the number of steps and the field count. Whether guest checkout exists. How clearly cancellation terms and fees are presented. What trust signals are visible. Which payment methods and currencies are supported, how errors are handled, and whether performance or accessibility might be adding unnecessary cognitive load. Most booking funnels don’t require innovation. They require friction to be removed.


## When Delivery Slips


The third scenario was about Agile delays. This is not my job per se, this should be done by an Agile Coach or a Scrum master, but I accepted the challenge. It was consulting after all. To my experience most of the companies out there are doing Agile wrong not intentionally but because they don’t have the required patience to let the system flourish. Agile to me is a set of principles not a dogma. When deadlines slip repeatedly, my default assumption is: The system needs fine tuning. Not the people, they are over processes according to the Agile Manifesto anyways. So I try to make the delay reasons visible.


### I Start With Baselines


Before changing anything, we should run a “Where do we lose time and why?” working session with with the team, tech and delivery leads shoulds be there to report metrics and how do they measure them. Without the baselines, improvement conversations become subjective. The outcome of the session should be an agreement on 2-3 measurable goals, and an experiment framework that measures changes.


**Metrics in the microscope**

- Time to delivery (Lead time + Cycle time)
- Predictability (% Delivered vs Committed)
- Blocked time (Waiting for dependencies)
- Rework rate (Tickets reopened after delivery)
- Context switching (Too much WIP = Slower delivery)

### My Bias Toward Clarity and Focus Protection


A few patterns I’ve seen repeatedly: Unclear tickets slow everything down, this is not Product work alone, the team should find a rythm on this one, some teams prefer basic ticket content some others prefer it in detail, if you are agile enough a basic ticket is okay and the subtickets should get the job done. Too much parallel work kills flow. Yes that’s true it takes focus to work on a ticket and if let’s say a ticket is 2 hours, 2 parallel tickets of 2 hours each make more than 4 hours for sure. Mid-sprint scope changes destroy predictability. Yes even if we say we do Scrum and our sprint is 2 weeks, I’ve seen cases where a customer jumps in and asks something for tomorrow. 


**So I tend to advocate for**

- A clear Definition of Ready (Let the team to decide this one)
- Weekly refinement with engineering and design
- WIP limits
- Capacity-aware planning
- A Definition of Done that includes tests, tracking, and release notes
- Small releases and progressive rollout.

### Stakeholder Alignment Is a System


One thing that has worked well for me is a lightweight product newsletter. So if delivery slips it might be because someone perceived it as slip because they were not aware of the context. Adding all stakeholders into this email list which is sent out and adjusted according to the needs. Nothing flashy, just clarity. When stakeholders know where things stand, noise decreases and delivery improves.


**What the email includes**

- Now / Next / Later
- Key risks
- Decisions taken
- Initiative status (Green / Orange / Red)
- Links to PRDs and decision logs

## Epilogue


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


