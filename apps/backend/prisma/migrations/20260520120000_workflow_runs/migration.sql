-- Workflow orchestration durable state
CREATE TABLE IF NOT EXISTS "workflow_runs" (
    "id" UUID NOT NULL,
    "workflow_key" VARCHAR(128) NOT NULL,
    "version" VARCHAR(32) NOT NULL DEFAULT '1',
    "status" VARCHAR(32) NOT NULL,
    "current_step_id" VARCHAR(128),
    "state" JSONB NOT NULL DEFAULT '{}',
    "step_history" JSONB NOT NULL DEFAULT '[]',
    "trace_id" VARCHAR(128),
    "last_error" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_workflow_runs_key_created_at"
    ON "workflow_runs"("workflow_key", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_workflow_runs_status_updated_at"
    ON "workflow_runs"("status", "updated_at" DESC);
