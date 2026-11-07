# Admin Dashboard

A modern, responsive Admin Dashboard web layout built as part of [The Odin Project](https://www.theodinproject.com/)'s Intermediate HTML and CSS curriculum. This project demonstrates layout architecture using **CSS Grid**, **Flexbox**, **Fluid Typography & Spacing**, and **Material Design Icons**.

---

## 🌟 Overview

The Admin Dashboard provides a structured web UI interface featuring:
- **Sidebar Navigation**: Links for main pages (Home, Profile, Messages, History, Tasks, Communities) and management tools (Settings, Support, Privacy).
- **Header Section**:
  - Top bar featuring search input, notifications, and user identity profile.
  - Bottom section with custom greeting, user handle, and action controls (*New*, *Upload*, *Share*).
- **Main Dashboard Section**:
  - **Your Projects**: Responsive card layout highlighting current projects with interaction buttons (Star, Watch, Share).
  - **Announcements**: Panel for site updates and news items.
  - **Trending**: Overview of active community members and trending projects.

---

## 📸 Design Reference

The layout design follows the Odin Project's Admin Dashboard project specification:

![Dashboard Reference Blueprint](https://raw.githubusercontent.com/TheOdinProject/curriculum/43cc6ab69fdfbef40d431a65677d2144668930ac/intermediate_html_css/grid/project_admin_dashboard/imgs/dashboard-project.png)

---

## 🛠️ Tech Stack & Features

- **HTML5**: Semantic markup (`<header>`, `<aside>`, `<main>`, `<section>`, `<nav>`).
- **CSS3 Grid & Flexbox**: Complete page scaffold using CSS Grid columns/rows and flex layouts for internal alignment.
- **Fluid Type & Space Scale**: Custom CSS variables derived via [Utopia.fyi](https://utopia.fyi/) for responsive typography (`clamp()`) and fluid spacing across screens.
- **Material Design Icons (MDI)**: Iconography via Pictogrammers MDI library CDN.
- **Custom CSS Reset**: Applied baseline styles based on Josh W. Comeau's CSS reset.

---

## 📁 File Structure

```
admin-dashboard/
├── index.html     # Main HTML structure and semantic dashboard containers
├── styles.css     # Primary CSS stylesheet with Grid layout and Utopia design tokens
├── reset.css      # Custom CSS reset stylesheet
└── README.md      # Project documentation and reference credits
```

---

## 📜 Credits & References

1. **[The Odin Project - Admin Dashboard Lesson](https://www.theodinproject.com/lessons/node-path-intermediate-html-and-css-admin-dashboard#project-solution)** – Project guide and curriculum requirements.
2. **[Pictogrammers Material Design Icons (MDI)](https://pictogrammers.com/library/mdi/)** – Vector icon set used for navigation and card action controls.
3. **[Google Fonts](https://fonts.google.com/selection/embed)** – Typography embedding for font styles (*Roboto* & *Cinzel*).
4. **[The Odin Project Dashboard Blueprint Image](https://raw.githubusercontent.com/TheOdinProject/curriculum/43cc6ab69fdfbef40d431a65677d2144668930ac/intermediate_html_css/grid/project_admin_dashboard/imgs/dashboard-project.png)** – Layout design wireframe and visual target image.
5. **[Josh W. Comeau's Custom CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/)** – Baseline reset rules applied in `reset.css`.
6. **[Utopia Fluid Space & Calculator](https://utopia.fyi/space/calculator?c=360,18,1.2,1240,20,1.25,5,2,&s=0.75%7C0.5%7C0.25,1.5%7C2%7C3%7C4%7C6,s-l&g=s,l,xl,12)** – Fluid space tokens and typography calc rules in `styles.css`.