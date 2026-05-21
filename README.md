# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.15.3 create --template minimal --types ts --add better-auth="demo:password,github" drizzle="database:postgresql+postgresql:neon" tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" vitest="usages:unit,component" playwright mdsvex" mcp="ide:opencode" --install pnpm roviolt-academy
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## About the APP (ROVIOLT ACADEMY)
Roviolt Academy is a product from the parent company Roviolt Inc. 
**Roviolt Academy** product is an elearning platform which will focus on selling courses to 
- Students 
- Enthusiasts, 
- Freelancers, 
- Enterprenures, 
- Company workforces(organisation training at any level), and 
- anyone who wants to earn skills. 

### Main Goal
The main goal is to teach courses through gamification strategies. in the prototype, I managed to use svelte 5 to make components like: 
**videoBlock.svelte** which uses hls.js for video streaming, 
**readingBlock.svelte** which uses mdsvx to show reading content, links, code and more for reading and guidance, 
**codeBlock.svelte** uses npm *codejar* package to run code in E2B secure sandboxes for code practice and testing, 
**excelBlock.svelte** was pure svelte 5 code to run excel in the client and its functions for spreadsheet training, the goal was to make more which will be made here, they will include the 
**graphicDesign.svelte** block to allow graphic design students to make projects in the browser, a 
**cybersecBlock.svelte** (with sub blocks) for 
- network analysis and design, 
- ethicalHacking sub blocks and so on, next is the 
**drag and drop block** to allow students to work with real world simulations (imagine gears in a system numbered, the question would ask gear selection and drag to correct position, then choose which gears will spin in a direction of a numbered gear?)
**wordBlock** Uses the npm package *tiptap* for advanced word processing
**projectManagementBlock** to give students access to tools for project management hands on lessons
**publicSpeakingBlocks** to allow students to confidently learn public speaking online
**videoEditingBlock** to allow simple day to day video edition (with the help of ffmpeg on the server via E2B + more advanced but simple tools for students to hone their skills)
**conceptVisualBlock** to allow concepts to be displayed and introduced in simple byte sized formats

AI assitance from NVIDIA NIM will allow students to strategically learn AI Engineering, code sandboxes will allow online project creation where real world industry tools will be made and showcased on platforms like linkedin to showcase potential to recruiter(s) and/or clients to work with

these blocks are used together across the course modules and lessons to deliver highend hands on training with all the help they can get from industry experts, business people and so many professionals