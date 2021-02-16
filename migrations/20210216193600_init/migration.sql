-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BAN_UNBAN', 'GUILD_MEMBER_JOIN_LEAVE', 'VOICE_CHANNEL', 'GUILD_MEMBER_UPDATE', 'USER_ACCOUNT_BIRTHDAY', 'MESSAGE_DELETE', 'MESSAGE_UPDATE');

-- CreateTable
CREATE TABLE "User" (
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 1000,
    "blacklistReason" TEXT,
    "dailyUsed" TIMESTAMP(3),
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "prefix" TEXT,
    "selfRoles" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id","guildId")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "channels" TEXT[],
    "guildId" TEXT NOT NULL,
    "id" "NotificationType" NOT NULL,

    PRIMARY KEY ("id","guildId")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
