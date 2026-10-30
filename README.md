# Irfan Sirkar · Portfolio

Personal site of Mohammad Irfan Sirkar, ML developer from Hyderabad.

Live: https://irfansirkar.github.io/PERSONAL-PORFOLIO-WEBSITE/

The page opens on a sticker-desk hero. Everything below it is driven by scroll:

| Section | What happens |
|---|---|
| **Hero** | Draggable, clickable game-gear stickers with parallax. A playable mini-game sits inside the headline. |
| **About** | A statement that lights up word by word, a player card with skill bars, and count-up stats. |
| **Skills** | A filterable inventory grid. |
| **Work** | A pinned section. Scrolling down slides the project cards sideways. |
| **Journey** | A level-map timeline that draws itself as you scroll. |
| **Achievements** | Trophy cards. |
| **Play** | A full endless-runner mini-game. The best score is saved in the browser. |
| **Contact** | Copy-email button and a marquee that reacts to scroll speed. |

There are five colour themes: Sunset, Mint, Grape, Lemon and Night. Switch between them with the round button in the nav.

## Stack

Plain HTML, CSS and JavaScript. There is no build step and no framework, and no image assets: every sticker and game sprite is drawn in code.

```
index.html      page structure
css/style.css   styles, themes and scroll-animation states
js/main.js      content data, scroll engine, stickers and mini-games
```

## Run locally

Open `index.html` in a browser, or run:

```sh
npx serve .
```

## Edit content

Projects, skills and the journey are arrays near the top of `js/main.js`:

- `P`: projects
- `SK`: skills
- `STOPS`: journey milestones

The About paragraph and the contact details are in `index.html`.
