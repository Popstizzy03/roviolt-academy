CREATE UNIQUE INDEX "module_order_idx" ON "lessons" USING btree ("module_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "course_order_idx" ON "modules" USING btree ("course_id","order");