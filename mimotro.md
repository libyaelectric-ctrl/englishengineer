# PRC TASK – GRAMMAR SYSTEM REDESIGN (ENGINEEROS)

## Objective

EngineerOS Grammar module is currently the weakest educational component in the platform.

This task is **NOT** a UI polish.

This task is **NOT** a visual redesign.

This task is a complete rethink of the Grammar learning architecture.

Forget the current implementation.

Analyze it only to understand its limitations, then redesign the entire experience from first principles.

---

# Background

EngineerOS is **NOT** another English learning app.

Its purpose is:

> Help engineers actually use English in real life.

Everything inside EngineerOS should move the user toward this goal.

Grammar is only one piece of a much larger learning system.

The learning pipeline should become

Vocabulary
↓

Grammar
↓

Reading

↓

Writing

↓

Speaking (future)

Grammar is NOT an isolated module.

It is the bridge between vocabulary and language production.

---

# Current Problems

The current Grammar page has serious architectural issues.

## 1.

The purpose of each lesson is unclear.

A user opens the page and cannot understand

- what they are learning
- why they are learning it
- where they are going next

There is no educational flow.

---

## 2.

Lessons feel like Wikipedia.

Definition

↓

Example

↓

Exercise

This is not how teachers teach.

The module needs to feel like a real teacher guiding the learner.

---

## 3.

Topic hierarchy is confusing.

Current implementation shows around 42 topics.

These topic names are abstract.

Examples

Past Perfect

Conditionals

Relative Clauses

Passive Voice

Gerunds

Articles

Most learners cannot answer

"What is this?"

or

"Do I know this?"

The hierarchy is fundamentally wrong.

---

## 4.

There is no relationship with Vocabulary.

Grammar currently ignores

- learned words
- review queue
- weak vocabulary
- active vocabulary

This wastes the entire Vocabulary system.

---

## 5.

Grammar does not feed Reading.

Reading does not feed Writing.

Everything is disconnected.

EngineerOS should feel like one continuous learning experience.

---

# New Philosophy

Grammar exists for one reason.

To teach the learner how to use the words they already know.

Grammar should never introduce huge amounts of new vocabulary.

Instead,

Grammar should recycle previously learned words.

Learning Rule

75%

Previously learned vocabulary

25%

New vocabulary

This principle should be respected throughout the module.

---

# Educational Flow

Each lesson should follow a teacher-driven approach.

Instead of

Definition

↓

Example

↓

Exercise

The flow should become

Teacher Introduction

↓

Concept Explanation

↓

Visual Example

↓

Guided Practice

↓

Mistake Correction

↓

Mini Quiz

↓

Reading Practice

↓

Writing Practice

The learner should never feel abandoned.

Every lesson should feel like a teacher is speaking directly to them.

---

# Teacher Style

The narration should feel human.

Example

Today we're going to learn how to introduce ourselves.

Don't worry.

Today's lesson has only one grammar rule.

By the end of this lesson you'll be introduce yourself naturally.

Then explain WHY.

Not just WHAT.

For Turkish speakers, explain common mistakes.

Example

Turkish often omits subjects.

English almost never does.

That is why Turkish learners often write

"Am engineer."

instead of

"I am an engineer."

These explanations create understanding instead of memorization.

---

# New Information Architecture

Do NOT expose hundreds of grammar rules.

Internally

EngineerOS may have

316 grammar rules.

That is fine.

Users should NEVER see a giant list.

Instead create this hierarchy.

CEFR Level

↓

Module

↓

Skill

↓

Lesson

↓

Exercise

Example

A1

↓

Sentence Basics

↓

Subject + Verb

↓

Lesson 1

↓

Practice

Another example

A2

↓

Talking About Yesterday

↓

Past Simple

↓

Lesson 1

↓

Exercises

This feels much more approachable.

---

# Grammar Database

Review the current grammar database.

Determine whether the existing structure supports

316 independent grammar skills.

If not,

propose a better database structure.

Requirements

Every grammar rule should have

- unique id
- CEFR level
- module
- skill
- lesson
- prerequisites
- difficulty
- estimated time
- learning objective
- related vocabulary
- related reading lessons
- related writing lessons
- review status
- mastery score

The grammar database should become the educational backbone of the platform.

---

# Learning Dependency

Every grammar lesson should know

Which vocabulary it depends on.

Which reading lesson it unlocks.

Which writing exercise it unlocks.

Example

Vocabulary

install

commission

breaker

switchboard

↓

Grammar

Present Simple

↓

Reading

Electrical installation report

↓

Writing

Write your own installation report.

This dependency chain should exist throughout the platform.

---

# Progress Tracking

Instead of showing only completion,

show multiple mastery indicators.

For every grammar skill display

Understanding

Practice

Writing

Reading

Speaking (future)

Review Status

Confidence

Weak Areas

This allows learners to immediately see where they struggle.

---

# Lesson Design

Each lesson should contain

Learning Objective

Teacher Explanation

Visual Examples

Animations (if possible)

Common Turkish Mistakes

Interactive Exercises

Mini Challenge

Reading Practice

Writing Practice

Review Summary

Estimated Time

Difficulty

XP Reward

---

# AI Integration

The AI should understand grammar mastery.

Example

The learner keeps making article mistakes.

Instead of recommending random lessons,

AI should say

You're struggling with Articles.

Review Lesson 3 before continuing.

Recommendations should be intelligent.

---

# Vocabulary Integration

Every lesson should begin with

Words you'll use today

Example

install

commission

switchboard

breaker

panel

Those words should appear throughout the lesson.

The learner should repeatedly encounter the same vocabulary.

---

# Reading Integration

Grammar completion should unlock reading.

Reading should immediately reinforce today's grammar.

Example

Grammar

Present Simple

↓

Reading

Daily Site Report

↓

Writing

Write today's site report.

---

# Writing Integration

Writing should never be generic.

It should always use today's grammar.

Today's objective

Present Simple

Today's vocabulary

install

panel

breaker

Writing Task

Write five sentences describing your work today.

---

# UX Requirements

The Grammar page should feel calm.

Minimal.

Modern.

Apple-level simplicity.

Linear-level clarity.

Notion-level organization.

Avoid

Huge grids

Huge topic lists

Information overload

The learner should always know

Where am I?

What am I learning?

Why am I learning this?

What comes next?

---

# Deliverables

Perform a complete audit of the existing Grammar module.

Identify every architectural weakness.

Identify database weaknesses.

Identify UX weaknesses.

Identify educational weaknesses.

Identify hierarchy weaknesses.

Identify naming weaknesses.

Then redesign

- Information architecture
- Navigation
- Lesson structure
- Database structure
- Progress system
- AI integration
- Vocabulary integration
- Reading integration
- Writing integration
- User journey

Do not be constrained by the current implementation.

Redesign the Grammar system as if EngineerOS were being built today from scratch.

The final solution should be scalable enough to support

A1 → C2

316+ grammar skills

Thousands of lessons

AI-powered recommendations

Long-term learner progression

without requiring another architectural redesign later.
