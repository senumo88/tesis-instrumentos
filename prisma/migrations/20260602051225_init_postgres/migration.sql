-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "date" TIMESTAMP(3),
    "area" TEXT,
    "position" TEXT,
    "interviewee" TEXT,
    "durationMinutes" INTEGER,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "category" TEXT,
    "objective" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "finding" TEXT,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "date" TIMESTAMP(3),
    "area" TEXT,
    "responsible" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "generalResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationActivity" (
    "id" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "previousActivity" TEXT,
    "currentActivity" TEXT,
    "nextActivity" TEXT,
    "responsible" TEXT,
    "document" TEXT,
    "tool" TEXT,
    "timeSpent" INTEGER,
    "waitingTime" INTEGER,
    "error" TEXT,
    "cause" TEXT,
    "reprocess" BOOLEAN NOT NULL DEFAULT false,
    "duplicated" BOOLEAN NOT NULL DEFAULT false,
    "noValue" BOOLEAN NOT NULL DEFAULT false,
    "delayType" TEXT,
    "automationOpportunity" TEXT,
    "notes" TEXT,

    CONSTRAINT "ObservationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAnalysis" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "date" TIMESTAMP(3),
    "area" TEXT,
    "responsible" TEXT,
    "generalResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRecord" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "documentName" TEXT,
    "documentType" TEXT,
    "processStage" TEXT,
    "areaResponsible" TEXT,
    "purpose" TEXT,
    "mediumUsed" TEXT,
    "detectedError" TEXT,
    "probableCause" TEXT,
    "errorImpact" TEXT,
    "validationType" TEXT,
    "validationsRequired" INTEGER,
    "reprocess" BOOLEAN NOT NULL DEFAULT false,
    "duplicated" BOOLEAN NOT NULL DEFAULT false,
    "repetitiveValidation" BOOLEAN NOT NULL DEFAULT false,
    "delayDetected" BOOLEAN NOT NULL DEFAULT false,
    "excessiveExcelEmailUse" BOOLEAN NOT NULL DEFAULT false,
    "documentValue" TEXT,
    "automatable" BOOLEAN NOT NULL DEFAULT false,
    "technologicalRequirement" TEXT,
    "digitalizationOpportunity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationActivity" ADD CONSTRAINT "ObservationActivity_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRecord" ADD CONSTRAINT "DocumentRecord_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "DocumentAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
