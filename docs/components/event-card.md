# Event Card

> **Plan your event. We'll take care of the rest.**

---

## Status

Draft

## Version

0.1

## Last Updated

2026-08-02

---

# Purpose

The Event Card is the first interactive component users encounter
when starting their event planning journey.

Instead of presenting a traditional form,
the application invites users to begin by selecting
the type of event they want to organize.

This component represents the beginning of the Event Planner journey.

---

# User Goal

Help users answer a single question:

**What would you like to celebrate?**

---

# Design Principles

The Event Card follows the project's Design Principles.

- The Event Comes First
- One Question Per Screen
- Conversations Over Forms
- Simplicity is a Feature

---

# Responsibilities

The Event Card is responsible for:

- Displaying the event type
- Displaying an icon representing the event
- Displaying a short description
- Showing hover and selected states
- Triggering the selection action

The component should NOT contain navigation logic.

Navigation belongs to the parent component.

---

# Visual Structure

+----------------------------------+

            Icon

         Event Name

 Short event description

+----------------------------------+

---

# States

## Default

Neutral appearance.

## Hover

- Slight elevation
- Stronger shadow
- Primary border color

## Selected

- Check icon
- Primary border
- Selected background
- Slight elevation

## Disabled

- Reduced opacity
- No hover effect
- No click interaction

---

# Inputs

| Name | Type | Description |
|------|------|-------------|
| title | string | Event name |
| description | string | Short description |
| icon | string | Material Symbol |
| selected | boolean | Selected state |
| disabled | boolean | Disabled state |

---

# Outputs

| Name | Description |
|------|-------------|
| selected | Triggered when the user selects the card |

---

# Accessibility

The component must:

- Support keyboard navigation
- Support screen readers
- Show visible focus
- Maintain sufficient contrast

---

# Future Improvements

Future versions may include:

- Event images
- Recommended badge
- AI recommendation badge
- Animation when selected

---

# Notes

The entire card is clickable.

No additional button should exist inside the card.

Selecting the card should immediately trigger the next step in the Event Planner journey.