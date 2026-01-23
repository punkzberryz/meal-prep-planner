-- CreateTable
CREATE TABLE "MealImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealImage_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MealImage_mealId_idx" ON "MealImage"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "MealImage_mealId_position_key" ON "MealImage"("mealId", "position");
