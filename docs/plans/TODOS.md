# TODOS

## [20th May 2026]
### initial Auth polish-up(s)

1. Add toggles for "Accept terms and Conditions" and also "privacy policy", these two will be mandatory. finally there will be "Accept marketing opt-in" which will be optional. (I bet this is where cron-jobs will be setup to send bulk emails on schedules or when a specific action triggers the email), the text(s) after the toggle will be hyperlinks which lead to pages for details on "terms and conditions", "privacy policies", and "marketing opt-in"

2. Account deletion + recovery within grace period, there has to be a strategic way to allow students to delete accounts but they will be informed that their accounts will be fully deleted after 30 days, but if they log in within this 30 days, they will be able to restore their account and details (and the schedule deletion resets and gets removed) betterAuth will be an extermely useful tool for this task. will there be need for inngest or trigger.dev? or SvelteKIT can also have long running code? but if I deploy code while the job is running, will it continue after the redeploy? I think this is where the delegation comes in where code is now running on these platforms to keep things running smoothly even after a redeploy

[x] add theme toggle with three states globally (light, dark, and system)