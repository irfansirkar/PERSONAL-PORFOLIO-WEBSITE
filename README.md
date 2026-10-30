# Irfan Quest

A playable pixel-art portfolio for Mohammad Irfan Sirkar, ML developer.

Visitors walk around a small town:
- Data Crystals are projects
- buildings and characters cover education, experience, awards, skills and contact
- ML-themed bugs run loose and can be squashed

Collecting things earns XP, levels (up to LV 10), achievements and an ending screen. Recruiters can press **R** at any time to read the plain resume instead.

## Run it

There is no build step. Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Edit the content

All text comes from [`js/data.js`](js/data.js): name, summary, work, achievements, projects and the skill tree. Change that file and reload.

- `linkedin` / `github`: paste your URLs and the buttons appear automatically.
- `skills[].items`: each skill lists which project ids (or character ids) unlock it in the Skill Tree.
- To add a project, add it to `projects` and give it a map position in `SPOTS` in [`js/game.js`](js/game.js).

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / arrow keys | joystick or tap to walk |
| Talk / interact | E, Space, Enter | A button or tap a character |
| Quest log | Q | Quests button |
| Project Dex | I | Projects button |
| Skill tree | K | Skills button |
| Plain resume | R | Resume button |
| Sound | M | Sound button |

Progress is saved in the browser and can be reset from the Quest Log.

## Deploy

It is a static site, so GitHub Pages, Netlify or Vercel all work with no configuration.
