import { timestamps } from "@/helpers/columns.helpers";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

enum CampaignStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
}

export const campaigns = sqliteTable("campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  title: text("title").notNull(),
  reward: integer("reward").notNull(),
  status: text("status").default(CampaignStatus.ACTIVE).notNull(),
  endDate: text("end_date").notNull(),
  ...timestamps,
});
