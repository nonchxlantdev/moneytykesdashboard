# MoneyTykes Teacher Dashboard Instructions

This is a React.js dashboard application for teachers/schools using MoneyTykes.

It is separate from the public MoneyTykes WordPress website.

## App Type
- React.js application
- Dashboard/admin-style interface
- Used by teachers to manage students, tasks, rewards, reports, financial literacy content, and class settings

## Design Direction
Use a clean, modern, school-friendly fintech dashboard style.

The app should feel:
- Professional
- Easy for teachers to use
- Kid-friendly without looking childish
- Fast and clean
- Similar to a SaaS dashboard

## Brand Colors
Use the MoneyTykes colors:
- Deep navy: #10162F
- Purple: #5B35D5
- Orange: #FF6B1A
- Gold: #FFC928
- Soft gray background: #F5F7FB
- White cards: #FFFFFF
- Light border: #E1E6F0

Optional teal accent for future refresh:
- Deep teal: #006D77
- Bright teal: #00A896
- Soft teal: #E6F7F5

## Layout Rules
- Keep the left sidebar navigation
- Keep the MoneyTykes logo at the top of the sidebar
- Sidebar should support collapsed and expanded states
- Main content should use cards with rounded corners
- Use soft shadows and clean borders
- Keep spacing generous
- Forms should be easy to scan
- Tables/lists should be clean and readable
- Mobile/tablet should stack sections properly

## Component Style
All major dashboard sections should be built as reusable React components.

Suggested components:
- Sidebar
- DashboardHeader
- PageTitle
- StatCard
- FormCard
- StudentForm
- EarningsForm
- RosterTable
- EmptyState
- PrimaryButton
- SecondaryButton
- Badge
- Modal
- ToastNotification

## Coding Rules
- Preserve existing functionality unless asked to change it
- Do not remove existing state logic
- Do not rename existing routes unless required
- Do not hardcode unnecessary mock data
- Use clean, readable JSX
- Keep components small and reusable
- Use existing project styling approach if one already exists
- Avoid adding heavy libraries unless necessary
- Make sure the app remains responsive

## Visual Improvements
When improving a screen:
- Do not change the purpose of the screen
- Improve spacing, alignment, hierarchy, and clarity
- Use consistent button styles
- Use consistent input styles
- Use clear empty states
- Add helpful labels and helper text where useful
- Keep the MoneyTykes brand visible but not overwhelming

## Important
This is not the marketing site.
This is not WordPress.
This is the teacher dashboard React app.