# Sogility Final Product Scope

## Source of truth

This scope is based on Louie’s confirmed direction.

## Scoring

Primary displayed score: SGI based on Relative Performance Score (RPS)

Displayed score range: 30–99

RPS is percentile-based within a player's age and gender cohort.

Skill categories:
- Passing
- Vision
- Dribbling
- Agility
- First Touch

Scoring tiers:
- Foundation: below 30
- Developing: 31–49
- Approaching: 50–69
- Strong: 70–89
- Elite: 90+

If a raw score is below 30, display 30 while still labeling it Foundation if needed.

## Product structure

The final product has two role-based experiences:

1. Trainer / manager view
2. Player / parent-facing view

## Trainer view priorities

Main purpose:
- Track a player’s progress in each category
- Show how a player performed compared to their previous assessment
- Make score input quick and simple

Trainer view should include:
- Trainer dashboard
- Player list
- Trainer player detail
- New assessment input flow

Trainer dashboard should include:
- Recent assessments
- Assessments this month
- Players improved
- Average SGI
- Quick action to start new assessment

Trainer player detail should include:
- Overall SGI
- Current vs previous assessment comparison
- Category-level progress for all five skills
- Assessment history
- Button to score new assessment

New assessment flow should include:
- Player selection
- Date
- Fast inputs for the five skills
- Optional notes
- Save action

## Player / parent-facing view priorities

Main purpose:
- Clear progress
- Overall score
- Easy-to-understand data
- Progress over time

Player view should include:
- Overall SGI prominently
- Tier label
- Last updated date
- Five skill bars
- Progress over time chart
- Simple assessment history

Player-facing language should be simple and parent-friendly.

## Remove or deprioritize

Remove from final main experience:
- Leaderboard
- Top performers
- Broad all-player comparisons for parents
- Player track selector unless needed internally
- Empty placeholder pages
- T-score labels
- Book session / recommended next session CTA unless explicitly requested later