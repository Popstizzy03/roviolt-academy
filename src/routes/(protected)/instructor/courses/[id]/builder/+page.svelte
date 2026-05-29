<script lang="ts">
import { enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "$lib/components/ui/card/index.js";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "$lib/components/ui/tabs/index.js";
import BlockEditorDispatcher from "$lib/components/course/blocks/BlockEditorDispatcher.svelte";

let { data }: { data: PageData } = $props();

let editingModuleId = $state<string | null>(null);
let editingLessonId = $state<string | null>(null);
let editingBlockId = $state<string | null>(null);
let editingBlockConfig = $state<Record<string, unknown>>({});
let editingBlockType = $state<string>("");
let addingModule = $state(false);
let addingLessonForModule = $state<string | null>(null);
let addingBlockForLesson = $state<string | null>(null);
let expandedModule = $state<string | null>(null);
let expandedLesson = $state<string | null>(null);

function lessonsForModule(moduleId: string) {
	return data.lessons.filter((l) => l.moduleId === moduleId);
}

function blocksForLesson(lessonId: string) {
	return data.blocks.filter((b) => b.lessonId === lessonId);
}

function blockTypeLabel(type: string) {
	const labels: Record<string, string> = {
		video: "Video",
		reading: "Reading",
		code: "Code Exercise",
		quiz: "Quiz",
		dragdrop: "Drag & Drop",
		excel: "Excel Exercise",
		graphic: "Graphic",
	};
	return labels[type] || type;
}

function priceDisplay(cents: number) {
	return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
}

async function handleReorderModules(moduleIds: string[]) {
	const order = moduleIds.map((id, i) => ({ id, order: (i + 1) * 10 }));
	const form = new FormData();
	form.append("order", JSON.stringify(order));
	await fetch("?/reorderModules", { method: "POST", body: form });
	await invalidateAll();
}

async function handleReorderLessons(lessonIds: string[]) {
	const order = lessonIds.map((id, i) => ({ id, order: (i + 1) * 10 }));
	const form = new FormData();
	form.append("order", JSON.stringify(order));
	await fetch("?/reorderLessons", { method: "POST", body: form });
	await invalidateAll();
}

function moveModuleUp(index: number) {
	if (index === 0) return;
	const ids = data.modules.map((m) => m.id);
	[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
	handleReorderModules(ids);
}

function moveModuleDown(index: number) {
	if (index === data.modules.length - 1) return;
	const ids = data.modules.map((m) => m.id);
	[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
	handleReorderModules(ids);
}

function moveLessonUp(moduleId: string, index: number) {
	const ls = lessonsForModule(moduleId);
	if (index === 0) return;
	const ids = ls.map((l) => l.id);
	[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
	handleReorderLessons(ids);
}

function moveLessonDown(moduleId: string, index: number) {
	const ls = lessonsForModule(moduleId);
	if (index === ls.length - 1) return;
	const ids = ls.map((l) => l.id);
	[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
	handleReorderLessons(ids);
}
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<div class="mb-8">
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-zinc-100">{data.course.title}</h1>
				<p class="mt-1 text-zinc-400">{data.course.description || "No description"}</p>
				<div class="mt-2 flex items-center gap-3">
					{#if data.course.isPublished}
						<Badge variant="default" class="bg-emerald-700 text-emerald-200">Published</Badge>
					{:else}
						<Badge variant="secondary">Draft</Badge>
					{/if}
					<span class="text-sm text-zinc-500">{priceDisplay(data.course.price)}</span>
					{#if data.course.category}
						<span class="text-sm text-zinc-500">{data.course.category}</span>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-3">
				<a href="/instructor/courses/{data.course.id}/edit">
					<Button variant="outline">Edit Details</Button>
				</a>
				<form method="POST" action="?/togglePublish" use:enhance>
					<Button type="submit" variant={data.course.isPublished ? "secondary" : "default"}>
						{data.course.isPublished ? "Unpublish" : "Publish"}
					</Button>
				</form>
			</div>
		</div>
	</div>

	<Tabs value="curriculum" class="space-y-6">
		<TabsList>
			<TabsTrigger value="curriculum">Curriculum</TabsTrigger>
			<TabsTrigger value="preview">Preview</TabsTrigger>
		</TabsList>

		<TabsContent value="curriculum">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-zinc-200">
					Modules & Lessons
					<span class="ml-2 text-sm font-normal text-zinc-500">({data.modules.length} modules, {data.lessons.length} lessons)</span>
				</h2>
				<Button onclick={() => (addingModule = true)}>+ Add Module</Button>
			</div>

			{#if addingModule}
				<form
					method="POST"
					action="?/addModule"
					use:enhance={() => { addingModule = false; return async () => {}; }}
					class="mb-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4"
				>
					<Input name="title" placeholder="Module title" class="mb-2" required />
					<Input name="description" placeholder="Module description (optional)" class="mb-3" />
					<input type="hidden" name="courseId" value={data.course.id} />
					<div class="flex gap-2">
						<Button type="submit">Add</Button>
						<Button type="button" variant="ghost" onclick={() => (addingModule = false)}>Cancel</Button>
					</div>
				</form>
			{/if}

			<div class="space-y-3">
				{#each data.modules as mod, modIndex (mod.id)}
					<Card class="border-zinc-800">
						<CardHeader class="flex flex-row items-center justify-between py-3">
							<button
								onclick={() => (expandedModule = expandedModule === mod.id ? null : mod.id)}
								class="flex items-center gap-3 text-left"
							>
								<span class="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
									{mod.order}
								</span>
								<div>
									<CardTitle class="text-base">{mod.title}</CardTitle>
									{#if mod.description}
										<CardDescription>{mod.description}</CardDescription>
									{/if}
								</div>
							</button>
							<div class="flex items-center gap-1">
								<button
									onclick={() => moveModuleUp(modIndex)}
									disabled={modIndex === 0}
									class="rounded p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
								>▲</button>
								<button
									onclick={() => moveModuleDown(modIndex)}
									disabled={modIndex === data.modules.length - 1}
									class="rounded p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
								>▼</button>
								<button
									onclick={() => (editingModuleId = editingModuleId === mod.id ? null : mod.id)}
									class="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
								>Edit</button>
								<form method="POST" action="?/deleteModule" use:enhance>
									<input type="hidden" name="moduleId" value={mod.id} />
									<button
										type="submit"
										class="rounded px-2 py-1 text-xs text-red-500 hover:text-red-400"
										onclick={() => confirm("Delete this module and all its lessons?")}
									>Delete</button>
								</form>
							</div>
						</CardHeader>

						{#if editingModuleId === mod.id}
							<CardContent class="border-t border-zinc-800 pb-4 pt-3">
								<form method="POST" action="?/updateModule" use:enhance={() => { editingModuleId = null; return async () => {}; }}>
									<input type="hidden" name="moduleId" value={mod.id} />
									<Input name="title" value={mod.title} class="mb-2" required />
									<Input name="description" value={mod.description || ""} placeholder="Description" class="mb-3" />
									<Button type="submit">Save</Button>
								</form>
							</CardContent>
						{/if}

						{#if expandedModule === mod.id}
							<CardContent class="border-t border-zinc-800 pt-3">
								<div class="space-y-2">
									{#each lessonsForModule(mod.id) as lesson, lessonIndex (lesson.id)}
										<div class="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
											<div class="flex items-center justify-between">
												<div class="flex items-center gap-2">
													<button
														onclick={() => moveLessonUp(mod.id, lessonIndex)}
														disabled={lessonIndex === 0}
														class="text-xs text-zinc-600 hover:text-zinc-400 disabled:opacity-20"
													>▲</button>
													<button
														onclick={() => moveLessonDown(mod.id, lessonIndex)}
														disabled={lessonIndex === lessonsForModule(mod.id).length - 1}
														class="text-xs text-zinc-600 hover:text-zinc-400 disabled:opacity-20"
													>▼</button>
													<span class="text-sm font-medium text-zinc-300">{lesson.title}</span>
													<span class="text-xs text-zinc-600">({blocksForLesson(lesson.id).length} blocks)</span>
												</div>
												<div class="flex items-center gap-1">
													<button
														onclick={() => (addingBlockForLesson = addingBlockForLesson === lesson.id ? null : lesson.id)}
														class="rounded px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-300"
													>+ Block</button>
													<button
														onclick={() => (expandedLesson = expandedLesson === lesson.id ? null : lesson.id)}
														class="rounded px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-300"
													>Blocks</button>
													<button
														onclick={() => (editingLessonId = editingLessonId === lesson.id ? null : lesson.id)}
														class="rounded px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-300"
													>Edit</button>
													<form method="POST" action="?/deleteLesson" use:enhance>
														<input type="hidden" name="lessonId" value={lesson.id} />
														<button type="submit" class="rounded px-2 py-0.5 text-xs text-red-500 hover:text-red-400">Delete</button>
													</form>
												</div>
											</div>

											{#if editingLessonId === lesson.id}
												<form method="POST" action="?/updateLesson" use:enhance={() => { editingLessonId = null; return async () => {}; }} class="mt-2 border-t border-zinc-800 pt-2">
													<input type="hidden" name="lessonId" value={lesson.id} />
													<Input name="title" value={lesson.title} class="mb-2 text-sm" required />
													<Input name="description" value={lesson.description || ""} placeholder="Description" class="mb-2 text-sm" />
													<Button type="submit" size="sm">Save</Button>
												</form>
											{/if}

											{#if addingBlockForLesson === lesson.id}
												<form method="POST" action="?/addBlock" use:enhance={() => { addingBlockForLesson = null; return async () => {}; }} class="mt-2 border-t border-zinc-800 pt-2">
													<input type="hidden" name="lessonId" value={lesson.id} />
													<div class="flex gap-2">
														<select
															name="type"
															class="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200"
															required
														>
															<option value="">Select block type...</option>
															<option value="reading">Reading</option>
															<option value="video">Video</option>
															<option value="code">Code Exercise</option>
															<option value="quiz">Quiz</option>
															<option value="dragdrop">Drag & Drop</option>
														</select>
														<Button type="submit" size="sm">Add</Button>
													</div>
												</form>
											{/if}

											{#if expandedLesson === lesson.id}
												<div class="mt-2 space-y-1 border-t border-zinc-800 pt-2">
													{#if blocksForLesson(lesson.id).length === 0}
														<p class="py-2 text-xs text-zinc-600">No blocks yet. Add a block above.</p>
													{:else}
														{#each blocksForLesson(lesson.id) as block (block.id)}
															<div class="rounded bg-zinc-900/60 px-3 py-1.5">
																<div class="flex items-center justify-between">
																	<div class="flex items-center gap-2">
																		<span class="text-xs text-zinc-500">#{block.order}</span>
																		<Badge variant="outline" class="text-xs">{blockTypeLabel(block.type)}</Badge>
																		<span class="text-xs text-zinc-500">{block.points} XP</span>
																	</div>
																	<div class="flex items-center gap-1">
																		<button
																			onclick={() => {
																				editingBlockId = editingBlockId === block.id ? null : block.id;
																				editingBlockConfig = { ...block.config as Record<string, unknown> };
																				editingBlockType = block.type;
																			}}
																			class="text-xs text-zinc-500 hover:text-zinc-300"
																		>Edit</button>
																		<form method="POST" action="?/deleteBlock" use:enhance>
																			<input type="hidden" name="blockId" value={block.id} />
																			<button type="submit" class="text-xs text-red-500 hover:text-red-400">Remove</button>
																		</form>
																	</div>
																</div>
																{#if editingBlockId === block.id}
																	<form
																		method="POST"
																		action="?/updateBlock"
																		use:enhance={() => { editingBlockId = null; return async () => {}; }}
																		class="mt-2 border-t border-zinc-800 pt-2"
																	>
																		<input type="hidden" name="blockId" value={block.id} />
																		<input type="hidden" name="type" value={block.type} />
																		<input type="hidden" name="config" value={JSON.stringify(editingBlockConfig)} />
																		<div class="mb-2">
																			<label class="mb-1 block text-xs font-medium text-zinc-400">
																				Content
																				<BlockEditorDispatcher type={editingBlockType} bind:config={editingBlockConfig} />
																			</label>
																		</div>
																		<div class="mb-2">
																			<label class="mb-1 block text-xs font-medium text-zinc-400" for="xp-{block.id}">XP Points</label>
																			<input
																				type="number"
																				name="points"
																				id="xp-{block.id}"
																				value={block.points}
																				class="w-24 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200"
																			/>
																		</div>
																		<Button type="submit" size="sm">Save Block</Button>
																	</form>
																{/if}
															</div>
														{/each}
													{/if}
												</div>
											{/if}
										</div>
									{/each}

									<button
										onclick={() => (addingLessonForModule = addingLessonForModule === mod.id ? null : mod.id)}
										class="mt-2 w-full rounded-lg border border-dashed border-zinc-700 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300"
									>
										{addingLessonForModule === mod.id ? "Cancel" : "+ Add Lesson"}
									</button>

									{#if addingLessonForModule === mod.id}
										<form
											method="POST"
											action="?/addLesson"
											use:enhance={() => { addingLessonForModule = null; return async () => {}; }}
											class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3"
										>
											<input type="hidden" name="moduleId" value={mod.id} />
											<Input name="title" placeholder="Lesson title" class="mb-2" required />
											<Input name="description" placeholder="Lesson description (optional)" class="mb-3" />
											<Button type="submit" size="sm">Add Lesson</Button>
										</form>
									{/if}
								</div>
							</CardContent>
						{/if}
					</Card>
				{/each}
			</div>
		</TabsContent>

		<TabsContent value="preview">
			<div class="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center">
				<p class="text-zinc-400">Preview will show how your course appears to students.</p>
				<a href="/courses/{data.course.slug}" class="mt-4 inline-block text-sm text-amber-500 hover:text-amber-400">
					View public page &rarr;
				</a>
			</div>
		</TabsContent>
	</Tabs>
</div>
