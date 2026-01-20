-- CreateEnum
CREATE TYPE "NextMeetCadence" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "nextMeetCadence" "NextMeetCadence";

