---
title: "Building another GPT wrapper on purpose"
date: "2026-01-29"
excerpt: "AI is everywhere and building with it has never been easier. Models are powerful, accessible, and here to stay. So if intelligence is becoming a commodity, what actually differentiates a product? This post is about building Easyscout, another “GPT wrapper”, and why focusing on real problems, UX, and orchestration matters more than the model itself."
tags: ["AI", "Building", "Product Management"]
draft: false
notionId: "2e573424-8c3c-8036-8e54-c8832fc7623f"
image: "/posts/another-gpt-wrapper.webp"
---


## When AI fades into the background


Discussions about AI products often revolve around the model; which one is used, how smart it sounds, how close it feels to reasoning. That framing made sense when access to intelligence was scarce. It doesn't hold anymore. Large Language Models are widely available, improving fast, and accessible to almost everyone. When intelligence becomes a commodity, it stops being a sustainable unique selling proposition.


What matters instead are things harder to copy and easier to underestimate:

- The core problem you choose to solve
- The clarity of the user workflow (Usability or UX)
- The constraints you deliberately introduce (Guardrails)
- The reliability of the system over time

This is where product thinking quietly takes the lead again.


## Why Easyscout exists


Basketball has been part of my life for over two decades. I'm now in my 22nd year as an amateur athlete, with the familiar rhythm of two to three practices per week and a game. As retirement slowly (or not that slowly) enters the conversation, the question becomes: what comes next? Coaching would be the obvious answer, but it's demanding, time-intensive, and hard to reconcile with life as a parent of toddlers. For now, my coaching diploma stays on the shelf.


Building small products for the sport felt more realistic. Not as a replacement for being on the court, but as a way to stay close to the game while applying a different skill set. Scouting reports, in particular, stood out. They're not creative writing exercises; they're structured, repetitive, and written for a specific audience. Coaches care about signal, consistency, and clarity. They don't want to learn how to prompt an AI, and they don't want variability for the sake of creativity. They want something that fits their mental model and daily workflow.


Easyscout started from a simple question: can an AI-powered tool generate a coach-ready scouting report with minimal input and zero setup? The challenge wasn't whether an LLM could write such a report, but whether the product could make that capability predictable, usable, and fast. That framing shaped every decision that followed.


If you're curious, you can see the product here: [https://easyscout.xyz](https://easyscout.xyz/)


## AI-powered app vs AI agent


AI-powered apps and AI agents are often conflated, but they represent different product philosophies. Easyscout is intentionally an AI-powered app, not an agent. The difference isn't academic—it affects UX, trust, and scope.


### An AI-powered app

- Is explicitly user-driven
- Operates within clear boundaries
- Produces immediate, inspectable output
- Keeps control with the user

### An AI agent

- Operates toward a goal
- Plans across multiple steps
- May act autonomously
- Requires stronger guardrails and trust

My long-term vision includes more agent-like behavior. The MVP doesn't. Shipping something focused is more valuable than shipping something ambitious and fragile. The goal for now is to gather early feedback and move deliberately toward a real scouting agent.


## The real work lives around the model


The most underestimated part of AI products is everything that isn't AI. Prompting is only one piece of the system. The rest determines whether the product feels reliable or experimental. In Easyscout, much of the effort went into things users never notice when they work well.


![The Easyscout architecture. While the LLM generates the report, the orchestration layer handles the 'unglamorous' work: caching, credit ledger, and observability via Sentry and PostHog.](/posts/another-gpt-wrapper-img1.png)


This includes:

- Smart caching so the same player name doesn't trigger multiple LLM calls
- Credit-based usage that behaves predictably and enables scaling
- User-isolated report storage
- Safe retries and idempotent operations
- Clear feedback when something goes wrong

None of these are model problems. They're all product and system design problems.


## Orchestration as a product skill


When intelligence is given, the builder's role shifts from inventing capability to orchestrating it. Orchestration here doesn't mean complex agent graphs or autonomous planning. It means designing a system that can be observed, understood, and improved over time.


For me, orchestration is tightly coupled with product-led iteration. Strong event and error tracking aren't operational details, they're feedback mechanisms. They allow the product to speak. Which flows are used, where users hesitate, what fails silently, and what fails loudly all inform me what to build next.


In Easyscout, this is where tools like PostHog and Sentry come in. Not as analytics dashboards to admire, but as instruments to guide decisions:

- Understanding how users move through the scouting flow
- Identifying drop-offs and friction points
- Tracking failed generations and edge cases
- Correlating errors with UX or prompt changes

A model generates text. A database enforces constraints. Payments introduce value exchange. Events and errors close the loop between intent and reality. Together, these parts allow the product to evolve deliberately toward its vision. This is where technical literacy and product judgment intersect.


## Open code, evolving product


The codebase is open and [available on GitHub](https://github.com/ntemposd/easyscout) (it’s an MVP), while the prompt remains private for now. This isn’t a play for secrecy; in a world of commodity LLMs, a prompt is a weak moat. However, the prompt currently acts as the laboratory for the **product’s logic.** Right now, **the prompt is doing the dirty work,** effectively simulating a data engine in a way that is fast and admittedly sloppy. It's a placeholder for the logic of a professional scout. If the feedback confirms that this provides real value to coaches, the next step isn't just a better prompt. It’s moving the "intelligence" out of the text window and into the system architecture. That means shifting from "LLM-guessing" to **orchestrating real-time data** through sports API integrations.


Keeping the prompt closed for now allows me to iterate on the **Product DNA** without hardening the structure too early. The goal is to prove the value first, then build the plumbing that makes it permanent.


## Closing thoughts


Easyscout isn't an attempt to redefine basketball scouting, nor is it an argument that GPT wrappers are inherently valuable. It's a practical exploration of modern product building in a world where intelligence is cheap and abundant. In that world, differentiation often moves elsewhere.


It moves to:

- Problem selection
- UX clarity
- Constraints and boundaries
- System reliability

Building another GPT wrapper is easy. Building a product people trust, reuse, and rely on isn't. That part is still hard, and that's where the work is.




<aside class="callout callout-default"><span class="callout-icon">🌐</span><div class="callout-content">

**Links**    
- Product ([https://easyscout.xyz](https://easyscout.xyz/))    
    
- Code ([https://github.com/ntemposd/easyscout](https://github.com/ntemposd/easyscout))

</div></aside>



